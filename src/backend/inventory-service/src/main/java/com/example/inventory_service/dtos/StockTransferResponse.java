package com.example.inventory_service.dtos;

public record StockTransferResponse(
        StockMovementResponse outbound,
        StockMovementResponse inbound
) {
}