package com.example.inventory_service.dtos;

import java.time.Instant;
import java.util.UUID;

public record WarehouseResponse(
        UUID id,
        String code,
        String name,
        String address,
        String city,
        String country,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}