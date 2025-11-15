package com.example.inventory_service.dtos;

import com.example.inventory_service.models.StockMovementType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record StockMovementResponse(
        UUID id,
        UUID itemId,
        UUID warehouseId,
        StockMovementType movementType,
        BigDecimal quantity,
        String reference,
        String reason,
        Instant occurredAt
) {
}