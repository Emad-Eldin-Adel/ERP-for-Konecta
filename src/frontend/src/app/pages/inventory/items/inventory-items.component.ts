import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  InventoryService,
  ItemRequest,
  ItemResponse,
  PagedResponse,
} from '../../../core/services/inventory.service';

@Component({
  selector: 'app-inventory-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-items.component.html',
})
export class InventoryItemsComponent implements OnInit {
  private inventory = inject(InventoryService);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal('');
  items = signal<ItemResponse[]>([]);
  pageState = signal<PagedResponse<ItemResponse> | null>(null);
  editing = signal<ItemResponse | null>(null);

  form = this.fb.nonNullable.group({
    sku: ['', [Validators.required, Validators.maxLength(64)]],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    unitOfMeasure: ['PCS', Validators.required],
    reorderPoint: [0, [Validators.required, Validators.min(0)]],
    reorderQuantity: [1, [Validators.required, Validators.min(0.01)]],
    active: [true],
  });

  summary = computed(() => {
    const current = this.items();
    const active = current.filter((item) => item.active).length;
    return { total: current.length, active, inactive: current.length - active };
  });

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(page = 0) {
    this.loading.set(true);
    this.inventory.listItems(page, 20).subscribe({
      next: (res) => {
        this.pageState.set(res);
        this.items.set(res.content);
        this.error.set('');
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to load items');
      },
      complete: () => this.loading.set(false),
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.value as ItemRequest;
    const target = this.editing();
    const request = target
      ? this.inventory.updateItem(target.id, payload)
      : this.inventory.createItem(payload);
    request.subscribe({
      next: () => {
        this.resetForm();
        this.loadItems(this.pageState()?.page ?? 0);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to save item');
      },
    });
  }

  edit(item: ItemResponse) {
    this.editing.set(item);
    this.form.patchValue({
      sku: item.sku,
      name: item.name,
      description: item.description ?? '',
      unitOfMeasure: item.unitOfMeasure,
      reorderPoint: item.reorderPoint,
      reorderQuantity: item.reorderQuantity,
      active: item.active,
    });
  }

  deactivate(item: ItemResponse) {
    this.inventory.deactivateItem(item.id).subscribe({
      next: () => this.loadItems(this.pageState()?.page ?? 0),
      error: (err) => this.error.set(err?.error?.message || 'Unable to deactivate item'),
    });
  }

  resetForm() {
    this.editing.set(null);
    this.form.reset({
      sku: '',
      name: '',
      description: '',
      unitOfMeasure: 'PCS',
      reorderPoint: 0,
      reorderQuantity: 1,
      active: true,
    });
  }

  trackById(_: number, item: ItemResponse) {
    return item.id;
  }

  pageLabel(page: number | undefined, totalPages: number | undefined) {
    if (page === undefined || totalPages === undefined) {
      return 'Page 1';
    }
    return `Page ${page + 1} / ${Math.max(totalPages, 1)}`;
  }
}
