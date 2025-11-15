import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  InventoryService,
  PagedResponse,
  WarehouseRequest,
  WarehouseResponse,
} from '../../../core/services/inventory.service';

@Component({
  selector: 'app-inventory-warehouses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-warehouses.component.html',
})
export class InventoryWarehousesComponent implements OnInit {
  private inventory = inject(InventoryService);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal('');
  warehouses = signal<WarehouseResponse[]>([]);
  pageState = signal<PagedResponse<WarehouseResponse> | null>(null);
  editing = signal<WarehouseResponse | null>(null);

  form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(32)]],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    address: [''],
    city: [''],
    country: [''],
    active: [true],
  });

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(page = 0) {
    this.loading.set(true);
    this.inventory.listWarehouses(page, 20).subscribe({
      next: (res) => {
        this.pageState.set(res);
        this.warehouses.set(res.content);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to load warehouses'),
      complete: () => this.loading.set(false),
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto = this.form.value as WarehouseRequest;
    const target = this.editing();
    const req = target
      ? this.inventory.updateWarehouse(target.id, dto)
      : this.inventory.createWarehouse(dto);
    req.subscribe({
      next: () => {
        this.resetForm();
        this.loadWarehouses(this.pageState()?.page ?? 0);
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to save warehouse'),
    });
  }

  edit(warehouse: WarehouseResponse) {
    this.editing.set(warehouse);
    this.form.patchValue({
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address ?? '',
      city: warehouse.city ?? '',
      country: warehouse.country ?? '',
      active: warehouse.active,
    });
  }

  deactivate(warehouse: WarehouseResponse) {
    this.inventory.deactivateWarehouse(warehouse.id).subscribe({
      next: () => this.loadWarehouses(this.pageState()?.page ?? 0),
      error: (err) => this.error.set(err?.error?.message || 'Unable to deactivate warehouse'),
    });
  }

  resetForm() {
    this.editing.set(null);
    this.form.reset({ code: '', name: '', address: '', city: '', country: '', active: true });
  }

  trackById(_: number, item: WarehouseResponse) {
    return item.id;
  }
}
