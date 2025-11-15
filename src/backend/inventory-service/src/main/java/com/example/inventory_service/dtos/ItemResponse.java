package com.example.inventory_service.dtos;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ItemResponse(
        UUID id,
        String sku,
        String name,
        String description,
        String unitOfMeasure,
        BigDecimal reorderPoint,
        BigDecimal reorderQuantity,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}