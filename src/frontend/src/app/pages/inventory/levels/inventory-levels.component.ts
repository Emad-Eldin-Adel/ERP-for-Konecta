import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  InventoryLevelResponse,
  InventoryService,
  ItemResponse,
  WarehouseResponse,
} from '../../../core/services/inventory.service';

@Component({
  selector: 'app-inventory-levels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-levels.component.html',
})
export class InventoryLevelsComponent implements OnInit {
  private inventory = inject(InventoryService);

  items = signal<ItemResponse[]>([]);
  warehouses = signal<WarehouseResponse[]>([]);
  levels = signal<InventoryLevelResponse[]>([]);
  loading = signal(false);
  error = signal('');
  selectedItem = signal<string>('');
  selectedWarehouse = signal<string>('');

  ngOnInit(): void {
    this.inventory.listItems(0, 100).subscribe((res) => this.items.set(res.content));
    this.inventory.listWarehouses(0, 100).subscribe((res) => this.warehouses.set(res.content));
  }

  loadByItem(itemId: string) {
    if (!itemId) {
      this.levels.set([]);
      return;
    }
    this.loading.set(true);
    this.inventory.getInventoryByItem(itemId).subscribe({
      next: (levels) => {
        this.levels.set(levels);
        this.error.set('');
        this.selectedWarehouse.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to load stock levels'),
      complete: () => this.loading.set(false),
    });
  }

  loadByWarehouse(warehouseId: string) {
    if (!warehouseId) {
      this.levels.set([]);
      return;
    }
    this.loading.set(true);
    this.inventory.getInventoryByWarehouse(warehouseId).subscribe({
      next: (levels) => {
        this.levels.set(levels);
        this.error.set('');
        this.selectedItem.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to load stock levels'),
      complete: () => this.loading.set(false),
    });
  }

  totalOnHand() {
    return this.levels().reduce((sum, level) => sum + (level.quantityOnHand ?? 0), 0);
  }
}
