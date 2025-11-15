package com.example.inventory_service.dtos;

import java.math.BigDecimal;
import java.util.UUID;

public record InventoryLevelResponse(
        UUID inventoryId,
        UUID itemId,
        UUID warehouseId,
        String itemSku,
        String itemName,
        String warehouseCode,
        BigDecimal quantityOnHand,
        BigDecimal reservedQuantity,
        BigDecimal availableQuantity
) {
}