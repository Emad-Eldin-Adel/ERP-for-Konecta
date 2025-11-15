package com.example.inventory_service.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "inventory_levels", uniqueConstraints = {
        @UniqueConstraint(name = "uk_inventory_item_warehouse", columnNames = {"item_id", "warehouse_id"})
})
public class InventoryLevel extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false, foreignKey = @ForeignKey(name = "fk_inventory_item"))
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warehouse_id", nullable = false, foreignKey = @ForeignKey(name = "fk_inventory_warehouse"))
    private Warehouse warehouse;

    @Column(name = "quantity_on_hand", precision = 19, scale = 2, nullable = false)
    private BigDecimal quantityOnHand = BigDecimal.ZERO;

    @Column(name = "reserved_quantity", precision = 19, scale = 2, nullable = false)
    private BigDecimal reservedQuantity = BigDecimal.ZERO;

    public InventoryLevel() {
    }

    public InventoryLevel(Item item, Warehouse warehouse) {
        this.item = item;
        this.warehouse = warehouse;
    }

    public UUID getId() {
        return id;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public BigDecimal getQuantityOnHand() {
        return quantityOnHand;
    }

    public void setQuantityOnHand(BigDecimal quantityOnHand) {
        this.quantityOnHand = quantityOnHand;
    }

    public BigDecimal getReservedQuantity() {
        return reservedQuantity;
    }

    public void setReservedQuantity(BigDecimal reservedQuantity) {
        this.reservedQuantity = reservedQuantity;
    }

    public BigDecimal getAvailableQuantity() {
        return quantityOnHand.subtract(reservedQuantity);
    }

    public void applyDelta(BigDecimal delta) {
        BigDecimal updated = quantityOnHand.add(delta);
        if (updated.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Quantity on hand cannot be negative");
        }
        this.quantityOnHand = updated;
    }

    public void reserve(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Reservation must be positive");
        }
        if (getAvailableQuantity().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient available quantity to reserve");
        }
        this.reservedQuantity = this.reservedQuantity.add(amount);
    }

    public void release(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Release amount must be positive");
        }
        if (this.reservedQuantity.compareTo(amount) < 0) {
            throw new IllegalArgumentException("Cannot release more than reserved");
        }
        this.reservedQuantity = this.reservedQuantity.subtract(amount);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof InventoryLevel that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
