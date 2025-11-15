import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  InventoryService,
  ItemResponse,
  MovementFilters,
  StockMovementRequest,
  StockMovementResponse,
  StockMovementType,
  StockTransferRequest,
  WarehouseResponse,
} from '../../../core/services/inventory.service';
import { FormsModule } from '@angular/forms';

const MOVEMENT_TYPES: StockMovementType[] = [
  'RECEIVE',
  'CONSUME',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
  'TRANSFER_IN',
  'TRANSFER_OUT',
];

@Component({
  selector: 'app-inventory-movements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inventory-movements.component.html',
})
export class InventoryMovementsComponent implements OnInit {
  private inventory = inject(InventoryService);
  private fb = inject(FormBuilder);

  movementTypes = MOVEMENT_TYPES;
  items = signal<ItemResponse[]>([]);
  warehouses = signal<WarehouseResponse[]>([]);
  movements = signal<StockMovementResponse[]>([]);
  page = signal(0);
  totalPages = signal(1);
  filters = signal<MovementFilters>({});
  loading = signal(false);
  error = signal('');

  movementForm = this.fb.nonNullable.group({
    itemId: ['', Validators.required],
    warehouseId: ['', Validators.required],
    movementType: ['RECEIVE' as StockMovementType, Validators.required],
    quantity: [1, [Validators.required, Validators.min(0.01)]],
    reference: [''],
    reason: [''],
  });

  transferForm = this.fb.nonNullable.group({
    itemId: ['', Validators.required],
    sourceWarehouseId: ['', Validators.required],
    targetWarehouseId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(0.01)]],
    reason: [''],
  });

  ngOnInit(): void {
    this.inventory.listItems(0, 100).subscribe((res) => this.items.set(res.content));
    this.inventory.listWarehouses(0, 100).subscribe((res) => this.warehouses.set(res.content));
    this.loadMovements();
  }

  loadMovements(page = 0) {
    this.loading.set(true);
    this.inventory.getMovements(this.filters(), page, 20).subscribe({
      next: (res) => {
        this.movements.set(res.content);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages || 1);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to load movements'),
      complete: () => this.loading.set(false),
    });
  }

  applyFilter(filter: MovementFilters) {
    this.filters.set(filter);
    this.loadMovements(0);
  }

  setItemFilter(itemId: string) {
    const next: MovementFilters = { ...this.filters() };
    if (itemId) {
      next.itemId = itemId;
    } else {
      delete next.itemId;
    }
    this.applyFilter(next);
  }

  setWarehouseFilter(warehouseId: string) {
    const next: MovementFilters = { ...this.filters() };
    if (warehouseId) {
      next.warehouseId = warehouseId;
    } else {
      delete next.warehouseId;
    }
    this.applyFilter(next);
  }

  submitMovement() {
    if (this.movementForm.invalid) {
      this.movementForm.markAllAsTouched();
      return;
    }
    const payload = this.movementForm.getRawValue() as StockMovementRequest;
    this.inventory.registerMovement(payload).subscribe({
      next: () => {
        this.movementForm.reset({ movementType: 'RECEIVE', quantity: 1 });
        this.loadMovements(this.page());
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to record movement'),
    });
  }

  submitTransfer() {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }
    const value = this.transferForm.getRawValue() as StockTransferRequest;
    if (value.sourceWarehouseId === value.targetWarehouseId) {
      this.error.set('Source and destination warehouses must be different.');
      return;
    }
    this.inventory.transferStock(value).subscribe({
      next: () => {
        this.transferForm.reset({ quantity: 1 });
        this.loadMovements(this.page());
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to record transfer'),
    });
  }

  trackMovement(_: number, movement: StockMovementResponse) {
    return movement.id;
  }
}
