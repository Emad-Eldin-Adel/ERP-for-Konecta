package com.example.inventory_service.repository;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.inventory_service.models.StockMovement;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    Page<StockMovement> findAllByItemId(UUID itemId, Pageable pageable);

    Page<StockMovement> findAllByWarehouseId(UUID warehouseId, Pageable pageable);
}
