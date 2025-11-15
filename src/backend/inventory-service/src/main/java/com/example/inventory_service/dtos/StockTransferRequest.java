package com.example.inventory_service.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record StockTransferRequest(
        @NotNull UUID itemId,
        @NotNull UUID sourceWarehouseId,
        @NotNull UUID targetWarehouseId,
        @NotNull @DecimalMin("0.01") BigDecimal quantity,
        @Size(max = 256) String reason
) {
}