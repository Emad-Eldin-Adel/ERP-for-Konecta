package com.example.inventory_service.controllers;

import com.example.inventory_service.dtos.PagedResponse;
import com.example.inventory_service.dtos.WarehouseRequest;
import com.example.inventory_service.dtos.WarehouseResponse;
import com.example.inventory_service.services.WarehouseService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warehouses")
@Validated
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @PostMapping
    public ResponseEntity<WarehouseResponse> create(@Valid @RequestBody WarehouseRequest request) {
        WarehouseResponse response = warehouseService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public WarehouseResponse update(@PathVariable UUID id, @Valid @RequestBody WarehouseRequest request) {
        return warehouseService.update(id, request);
    }

    @GetMapping("/{id}")
    public WarehouseResponse findById(@PathVariable UUID id) {
        return warehouseService.findById(id);
    }

    @GetMapping
    public PagedResponse<WarehouseResponse> findAll(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(size, 100));
        return warehouseService.findAll(pageable);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        warehouseService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}