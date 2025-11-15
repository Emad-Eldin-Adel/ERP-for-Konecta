package com.example.inventory_service.dtos;

import com.example.inventory_service.models.StockMovementType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record StockMovementRequest(
        @NotNull UUID itemId,
        @NotNull UUID warehouseId,
        @NotNull StockMovementType movementType,
        @NotNull @DecimalMin("0.01") BigDecimal quantity,
        @Size(max = 64) String reference,
        @Size(max = 256) String reason
) {
}