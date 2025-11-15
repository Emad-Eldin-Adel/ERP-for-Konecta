package com.example.inventory_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.inventory_service.models.InventoryLevel;

public interface InventoryLevelRepository extends JpaRepository<InventoryLevel, UUID> {

    Optional<InventoryLevel> findByItemIdAndWarehouseId(UUID itemId, UUID warehouseId);

    List<InventoryLevel> findAllByItemId(UUID itemId);

    List<InventoryLevel> findAllByWarehouseId(UUID warehouseId);
}
