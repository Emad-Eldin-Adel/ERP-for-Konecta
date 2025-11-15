package com.example.inventory_service.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ItemRequest(
        @NotBlank(message = "SKU is required")
        @Size(max = 64, message = "SKU must be under 64 characters")
        String sku,

        @NotBlank(message = "Name is required")
        @Size(max = 120)
        String name,

        @Size(max = 512)
        String description,

        @NotBlank(message = "Unit of measure is required")
        @Size(max = 32)
        String unitOfMeasure,

        @NotNull
        @DecimalMin(value = "0.00", inclusive = true)
        BigDecimal reorderPoint,

        @NotNull
        @DecimalMin(value = "0.01", inclusive = true)
        BigDecimal reorderQuantity,

        Boolean active
) {
}