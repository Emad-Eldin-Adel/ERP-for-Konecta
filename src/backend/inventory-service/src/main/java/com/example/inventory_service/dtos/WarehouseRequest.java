package com.example.inventory_service.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WarehouseRequest(
        @NotBlank
        @Size(max = 32)
        String code,

        @NotBlank
        @Size(max = 160)
        String name,

        @Size(max = 255)
        String address,

        @Size(max = 120)
        String city,

        @Size(max = 120)
        String country,

        Boolean active
) {
}