package com.example.inventory_service.services;

import com.example.inventory_service.dtos.ItemRequest;
import com.example.inventory_service.dtos.ItemResponse;
import com.example.inventory_service.dtos.PagedResponse;
import com.example.inventory_service.exceptions.ConflictException;
import com.example.inventory_service.exceptions.ResourceNotFoundException;
import com.example.inventory_service.models.Item;
import com.example.inventory_service.repository.ItemRepository;
import java.text.MessageFormat;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public ItemResponse create(ItemRequest request) {
        validateSkuUniqueness(request.sku(), null);
        Item item = new Item();
        applyRequest(item, request, true);
        Item saved = itemRepository.save(item);
        return toResponse(saved);
    }

    public ItemResponse update(UUID id, ItemRequest request) {
        Item item = findByIdOrThrow(id);
        validateSkuUniqueness(request.sku(), id);
        applyRequest(item, request, false);
        return toResponse(item);
    }

    @Transactional(readOnly = true)
    public ItemResponse findById(UUID id) {
        Item item = findByIdOrThrow(id);
        return toResponse(item);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ItemResponse> findAll(Pageable pageable) {
        Page<ItemResponse> page = itemRepository.findAllByActiveTrue(pageable)
                .map(this::toResponse);
        return PagedResponse.from(page);
    }

    public void deactivate(UUID id) {
        Item item = findByIdOrThrow(id);
        if (item.isActive()) {
            item.deactivate();
        }
    }

    private Item findByIdOrThrow(UUID id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        MessageFormat.format("Item with id {0} was not found", id)));
    }

    private void validateSkuUniqueness(String sku, UUID itemId) {
        String normalizedSku = sku.trim();
        boolean exists = itemId == null
                ? itemRepository.existsBySkuIgnoreCase(normalizedSku)
                : itemRepository.existsBySkuIgnoreCaseAndIdNot(normalizedSku, itemId);
        if (exists) {
            throw new ConflictException(MessageFormat.format("SKU {0} already exists", normalizedSku));
        }
    }

    private void applyRequest(Item item, ItemRequest request, boolean creating) {
        item.setSku(request.sku().trim());
        item.setName(request.name().trim());
        item.setDescription(request.description());
        item.setUnitOfMeasure(request.unitOfMeasure().trim());
        item.setReorderPoint(request.reorderPoint());
        item.setReorderQuantity(request.reorderQuantity());
        if (creating) {
            item.setActive(request.active() == null || request.active());
        } else if (request.active() != null) {
            item.setActive(request.active());
        }
    }

    private ItemResponse toResponse(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getSku(),
                item.getName(),
                item.getDescription(),
                item.getUnitOfMeasure(),
                item.getReorderPoint(),
                item.getReorderQuantity(),
                item.isActive(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}