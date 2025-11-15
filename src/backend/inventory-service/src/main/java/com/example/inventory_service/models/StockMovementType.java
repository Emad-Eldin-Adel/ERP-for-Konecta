package com.example.inventory_service.models;

public enum StockMovementType {
    RECEIVE(1),
    CONSUME(-1),
    ADJUSTMENT_IN(1),
    ADJUSTMENT_OUT(-1),
    TRANSFER_IN(1),
    TRANSFER_OUT(-1);

    private final int direction;

    StockMovementType(int direction) {
        this.direction = direction;
    }

    public int direction() {
        return direction;
    }
}
