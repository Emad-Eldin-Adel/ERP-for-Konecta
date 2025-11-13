import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FinanceInvoice,
  FinanceService,
  InvoiceItem,
  InvoiceRequest,
  InvoiceStatus,
} from '../../../core/services/finance.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

type FilterStatus = 'ALL' | InvoiceStatus;

@Component({
  selector: 'app-finance-invoices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './finance-invoices.component.html',
})
export class FinanceInvoicesComponent implements OnInit {
  private finance = inject(FinanceService);
  private fb = inject(FormBuilder);

  invoices = signal<FinanceInvoice[]>([]);
  statusFilter = signal<FilterStatus>('ALL');
  loading = signal(false);
  submitting = signal(false);
  error = signal('');
  formError = signal('');
  showForm = signal(false);
  readonly statuses: FilterStatus[] = ['ALL', 'DRAFT', 'SENT', 'PAID'];

  form = this.fb.group({
    clientName: this.fb.nonNullable.control('', Validators.required),
    invoiceDate: this.fb.control<string>(''),
    items: this.fb.array([this.buildItemGroup()]),
  });

  totalDraft = computed(() =>
    this.invoices()
      .filter((inv) => inv.status !== 'PAID')
      .reduce((sum, inv) => sum + (inv.grandTotal ?? inv.amount ?? 0), 0)
  );

  filteredInvoices = computed(() => {
    const filter = this.statusFilter();
    if (filter === 'ALL') {
      return this.invoices();
    }
    return this.invoices().filter((inv) => inv.status === filter);
  });

  get items(): FormArray<FormGroup> {
    return this.form.get('items') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading.set(true);
    const filter = this.statusFilter();
    this.finance.getInvoices(filter === 'ALL' ? undefined : filter).subscribe({
      next: (list) => {
        this.invoices.set(list);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to load invoices.'),
      complete: () => this.loading.set(false),
    });
  }

  changeFilter(status: FilterStatus) {
    if (this.statusFilter() === status) return;
    this.statusFilter.set(status);
    this.loadInvoices();
  }

  addItem() {
    this.items.push(this.buildItemGroup());
  }

  removeItem(index: number) {
    if (this.items.length === 1) return;
    this.items.removeAt(index);
  }

  openForm() {
    this.form.reset();
    this.items.clear();
    this.items.push(this.buildItemGroup());
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  submitInvoice() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.mapToRequest(this.form.getRawValue());
    if (!payload.items.length) {
      this.formError.set('Add at least one line item.');
      return;
    }
    this.submitting.set(true);
    this.finance.createInvoice(payload).subscribe({
      next: (invoice) => {
        this.invoices.update((list) => [invoice, ...list]);
        this.closeForm();
      },
      error: (err) => this.formError.set(err?.error?.message || 'Unable to create invoice.'),
      complete: () => this.submitting.set(false),
    });
  }

  sendInvoice(invoice: FinanceInvoice) {
    this.finance.sendInvoice(invoice.id).subscribe({
      next: (updated) => this.replaceInvoice(updated),
      error: (err) => (this.error.set(err?.error?.message || 'Unable to send invoice.')),
    });
  }

  markPaid(invoice: FinanceInvoice) {
    this.finance.markInvoicePaid(invoice.id).subscribe({
      next: (updated) => this.replaceInvoice(updated),
      error: (err) => (this.error.set(err?.error?.message || 'Unable to mark invoice paid.')),
    });
  }

  totalFor(invoice: FinanceInvoice) {
    return invoice.grandTotal ?? invoice.untaxedTotal ?? invoice.amount ?? 0;
  }

  formatCurrency(amount: number | null | undefined) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0);
  }

  trackInvoice = (_: number, invoice: FinanceInvoice) => invoice.id;

  private buildItemGroup() {
    return this.fb.group({
      product: this.fb.nonNullable.control('', Validators.required),
      account: this.fb.control<string>(''),
      quantity: this.fb.control<number | null>(1, [Validators.required, Validators.min(0.01)]),
      price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
      discountPercent: this.fb.control<number | null>(0),
      taxPercent: this.fb.control<number | null>(0),
      whPercent: this.fb.control<number | null>(0),
    });
  }

  private mapToRequest(raw: any): InvoiceRequest {
    const items: InvoiceItem[] = (raw.items || [])
      .map((item: any) => ({
        product: item.product?.trim() || null,
        account: item.account?.trim() || null,
        quantity: item.quantity != null ? Number(item.quantity) : null,
        price: item.price != null ? Number(item.price) : null,
        discountPercent: item.discountPercent != null ? Number(item.discountPercent) : null,
        taxPercent: item.taxPercent != null ? Number(item.taxPercent) : null,
        whPercent: item.whPercent != null ? Number(item.whPercent) : null,
      }))
      .filter((item: InvoiceItem) => (item.product && item.quantity && item.price));

    return {
      clientName: raw.clientName ?? '',
      invoiceDate: raw.invoiceDate || null,
      items,
    };
  }

  private replaceInvoice(updated: FinanceInvoice) {
    this.invoices.update((list) => list.map((inv) => (inv.id === updated.id ? updated : inv)));
  }
}
