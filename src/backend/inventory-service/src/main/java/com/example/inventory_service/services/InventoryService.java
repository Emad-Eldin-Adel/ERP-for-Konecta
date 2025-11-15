package com.example.inventory_service.services;

import com.example.inventory_service.dtos.InventoryLevelResponse;
import com.example.inventory_service.dtos.PagedResponse;
import com.example.inventory_service.dtos.StockMovementRequest;
import com.example.inventory_service.dtos.StockMovementResponse;
import com.example.inventory_service.dtos.StockTransferRequest;
import com.example.inventory_service.dtos.StockTransferResponse;
import com.example.inventory_service.exceptions.BusinessRuleException;
import com.example.inventory_service.exceptions.ResourceNotFoundException;
import com.example.inventory_service.models.InventoryLevel;
import com.example.inventory_service.models.Item;
import com.example.inventory_service.models.StockMovement;
import com.example.inventory_service.models.StockMovementType;
import com.example.inventory_service.models.Warehouse;
import com.example.inventory_service.repository.InventoryLevelRepository;
import com.example.inventory_service.repository.ItemRepository;
import com.example.inventory_service.repository.StockMovementRepository;
import com.example.inventory_service.repository.WarehouseRepository;
import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InventoryService {

    private final ItemRepository itemRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryLevelRepository inventoryLevelRepository;
    private final StockMovementRepository stockMovementRepository;

    public InventoryService(ItemRepository itemRepository,
                            WarehouseRepository warehouseRepository,
                            InventoryLevelRepository inventoryLevelRepository,
                            StockMovementRepository stockMovementRepository) {
        this.itemRepository = itemRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryLevelRepository = inventoryLevelRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryLevelResponse> findInventoryByItem(UUID itemId) {
        ensureActiveItem(itemId);
        return inventoryLevelRepository.findAllByItemId(itemId).stream()
                .map(this::toInventoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InventoryLevelResponse> findInventoryByWarehouse(UUID warehouseId) {
        ensureActiveWarehouse(warehouseId);
        return inventoryLevelRepository.findAllByWarehouseId(warehouseId).stream()
                .map(this::toInventoryResponse)
                .toList();
    }

    public StockMovementResponse registerMovement(StockMovementRequest request) {
        Item item = ensureActiveItem(request.itemId());
        Warehouse warehouse = ensureActiveWarehouse(request.warehouseId());
        return recordMovement(item, warehouse, request.movementType(), request.quantity(),
                request.reference(), request.reason());
    }

    public StockTransferResponse transfer(StockTransferRequest request) {
        if (request.sourceWarehouseId().equals(request.targetWarehouseId())) {
            throw new BusinessRuleException("Source and target warehouses must be different");
        }
        Item item = ensureActiveItem(request.itemId());
        Warehouse source = ensureActiveWarehouse(request.sourceWarehouseId());
        Warehouse target = ensureActiveWarehouse(request.targetWarehouseId());
        String reference = UUID.randomUUID().toString();

        StockMovementResponse outbound = recordMovement(item, source, StockMovementType.TRANSFER_OUT,
                request.quantity(), reference, request.reason());
        StockMovementResponse inbound = recordMovement(item, target, StockMovementType.TRANSFER_IN,
                request.quantity(), reference, request.reason());
        return new StockTransferResponse(outbound, inbound);
    }

    @Transactional(readOnly = true)
    public PagedResponse<StockMovementResponse> findMovements(UUID itemId, UUID warehouseId, Pageable pageable) {
        Page<StockMovement> page;
        if (itemId != null) {
            page = stockMovementRepository.findAllByItemId(itemId, pageable);
        } else if (warehouseId != null) {
            page = stockMovementRepository.findAllByWarehouseId(warehouseId, pageable);
        } else {
            page = stockMovementRepository.findAll(pageable);
        }
        return PagedResponse.from(page.map(this::toMovementResponse));
    }

    private StockMovementResponse recordMovement(Item item,
                                                  Warehouse warehouse,
                                                  StockMovementType type,
                                                  BigDecimal quantity,
                                                  String reference,
                                                  String reason) {
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Quantity must be greater than zero");
        }
        InventoryLevel level = inventoryLevelRepository
                .findByItemIdAndWarehouseId(item.getId(), warehouse.getId())
                .orElseGet(() -> new InventoryLevel(item, warehouse));
        BigDecimal signedDelta = quantity.multiply(BigDecimal.valueOf(type.direction()));
        try {
            level.applyDelta(signedDelta);
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException(ex.getMessage());
        }
        inventoryLevelRepository.save(level);

        StockMovement movement = new StockMovement();
        movement.setItem(item);
        movement.setWarehouse(warehouse);
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setReference(reference);
        movement.setReason(reason);
        StockMovement saved = stockMovementRepository.save(movement);
        return toMovementResponse(saved);
    }

    private Item ensureActiveItem(UUID itemId) {
        return itemRepository.findByIdAndActiveTrue(itemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        MessageFormat.format("Active item with id {0} was not found", itemId)));
    }

    private Warehouse ensureActiveWarehouse(UUID warehouseId) {
        return warehouseRepository.findByIdAndActiveTrue(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        MessageFormat.format("Active warehouse with id {0} was not found", warehouseId)));
    }

    private InventoryLevelResponse toInventoryResponse(InventoryLevel level) {
        return new InventoryLevelResponse(
                level.getId(),
                level.getItem().getId(),
                level.getWarehouse().getId(),
                level.getItem().getSku(),
                level.getItem().getName(),
                level.getWarehouse().getCode(),
                level.getQuantityOnHand(),
                level.getReservedQuantity(),
                level.getAvailableQuantity()
        );
    }

    private StockMovementResponse toMovementResponse(StockMovement movement) {
        return new StockMovementResponse(
                movement.getId(),
                movement.getItem().getId(),
                movement.getWarehouse().getId(),
                movement.getType(),
                movement.getQuantity(),
                movement.getReference(),
                movement.getReason(),
                movement.getOccurredAt()
        );
    }
}
