package com.example.inventory_service.services;

import com.example.inventory_service.dtos.PagedResponse;
import com.example.inventory_service.dtos.WarehouseRequest;
import com.example.inventory_service.dtos.WarehouseResponse;
import com.example.inventory_service.exceptions.ConflictException;
import com.example.inventory_service.exceptions.ResourceNotFoundException;
import com.example.inventory_service.models.Warehouse;
import com.example.inventory_service.repository.WarehouseRepository;
import java.text.MessageFormat;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    public WarehouseResponse create(WarehouseRequest request) {
        validateCode(request.code(), null);
        Warehouse warehouse = new Warehouse();
        applyRequest(warehouse, request, true);
        return toResponse(warehouseRepository.save(warehouse));
    }

    public WarehouseResponse update(UUID id, WarehouseRequest request) {
        Warehouse warehouse = findByIdOrThrow(id);
        validateCode(request.code(), id);
        applyRequest(warehouse, request, false);
        return toResponse(warehouse);
    }

    @Transactional(readOnly = true)
    public WarehouseResponse findById(UUID id) {
        Warehouse warehouse = findByIdOrThrow(id);
        return toResponse(warehouse);
    }

    @Transactional(readOnly = true)
    public PagedResponse<WarehouseResponse> findAll(Pageable pageable) {
        Page<WarehouseResponse> page = warehouseRepository.findAllByActiveTrue(pageable)
                .map(this::toResponse);
        return PagedResponse.from(page);
    }

    public void deactivate(UUID id) {
        Warehouse warehouse = findByIdOrThrow(id);
        if (warehouse.isActive()) {
            warehouse.deactivate();
        }
    }

    private Warehouse findByIdOrThrow(UUID id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        MessageFormat.format("Warehouse with id {0} was not found", id)));
    }

    private void validateCode(String code, UUID idToExclude) {
        String normalized = code.trim();
        boolean exists = idToExclude == null
                ? warehouseRepository.existsByCodeIgnoreCase(normalized)
                : warehouseRepository.existsByCodeIgnoreCaseAndIdNot(normalized, idToExclude);
        if (exists) {
            throw new ConflictException(MessageFormat.format("Warehouse code {0} already exists", normalized));
        }
    }

    private void applyRequest(Warehouse warehouse, WarehouseRequest request, boolean creating) {
        warehouse.setCode(request.code().trim());
        warehouse.setName(request.name().trim());
        warehouse.setAddress(request.address());
        warehouse.setCity(request.city());
        warehouse.setCountry(request.country());
        if (creating) {
            warehouse.setActive(request.active() == null || request.active());
        } else if (request.active() != null) {
            warehouse.setActive(request.active());
        }
    }

    private WarehouseResponse toResponse(Warehouse warehouse) {
        return new WarehouseResponse(
                warehouse.getId(),
                warehouse.getCode(),
                warehouse.getName(),
                warehouse.getAddress(),
                warehouse.getCity(),
                warehouse.getCountry(),
                warehouse.isActive(),
                warehouse.getCreatedAt(),
                warehouse.getUpdatedAt()
        );
    }
}