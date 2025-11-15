package com.example.inventory_service.controllers;

import com.example.inventory_service.dtos.InventoryLevelResponse;
import com.example.inventory_service.dtos.PagedResponse;
import com.example.inventory_service.dtos.StockMovementRequest;
import com.example.inventory_service.dtos.StockMovementResponse;
import com.example.inventory_service.dtos.StockTransferRequest;
import com.example.inventory_service.dtos.StockTransferResponse;
import com.example.inventory_service.services.InventoryService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
@Validated
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/items/{itemId}")
    public List<InventoryLevelResponse> getInventoryByItem(@PathVariable UUID itemId) {
        return inventoryService.findInventoryByItem(itemId);
    }

    @GetMapping("/warehouses/{warehouseId}")
    public List<InventoryLevelResponse> getInventoryByWarehouse(@PathVariable UUID warehouseId) {
        return inventoryService.findInventoryByWarehouse(warehouseId);
    }

    @GetMapping("/movements")
    public PagedResponse<StockMovementResponse> getMovements(@RequestParam(required = false) UUID itemId,
                                                             @RequestParam(required = false) UUID warehouseId,
                                                             @RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(size, 100));
        return inventoryService.findMovements(itemId, warehouseId, pageable);
    }

    @PostMapping("/movements")
    public ResponseEntity<StockMovementResponse> registerMovement(@Valid @RequestBody StockMovementRequest request) {
        StockMovementResponse response = inventoryService.registerMovement(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/transfers")
    public ResponseEntity<StockTransferResponse> registerTransfer(@Valid @RequestBody StockTransferRequest request) {
        StockTransferResponse response = inventoryService.transfer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}