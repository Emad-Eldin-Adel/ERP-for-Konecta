import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  invoices = signal<FinanceInvoice[]>([]);
  statusFilter = signal<FilterStatus>('ALL');
  loading = signal(false);
  submitting = signal(false);
  error = signal('');
  formError = signal('');
  showForm = signal(false);
  editingInvoiceId = signal<number | null>(null);
  pdfPreviewUrl = signal<SafeResourceUrl | null>(null);
  pdfError = signal('');
  uploadingPdf = signal(false);
  selectedPdf: File | null = null;
  private pdfObjectUrl: string | null = null;
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
  formTitle = computed(() => (this.editingInvoiceId() ? 'Update invoice' : 'Create invoice'));

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
    const invoiceId = Number(this.route.snapshot.queryParamMap.get('id'));
    if (!Number.isNaN(invoiceId) && invoiceId > 0) {
      this.loadInvoiceDetails(invoiceId);
    }
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
    this.pdfError.set('');
    this.editingInvoiceId.set(null);
    this.selectedPdf = null;
    this.clearPdfPreview();
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingInvoiceId.set(null);
    this.selectedPdf = null;
    this.pdfError.set('');
    this.clearPdfPreview();
    this.form.reset();
    this.items.clear();
    this.items.push(this.buildItemGroup());
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

    const editingId = this.editingInvoiceId();
    this.submitting.set(true);
    const request$ = editingId
      ? this.finance.updateInvoice(editingId, payload)
      : this.finance.createInvoice(payload);

    request$.subscribe({
      next: (invoice) => {
        if (editingId) {
          this.replaceInvoice(invoice);
        } else {
          this.invoices.update((list) => [invoice, ...list]);
        }
        this.afterSubmit(invoice);
      },
      error: (err) => {
        this.formError.set(err?.error?.message || (editingId ? 'Unable to update invoice.' : 'Unable to create invoice.'));
        this.submitting.set(false);
      },
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

  editInvoice(invoice: FinanceInvoice) {
    this.populateForm(invoice);
    this.editingInvoiceId.set(invoice.id);
    this.formError.set('');
    this.pdfError.set('');
    this.showForm.set(true);
    if (invoice.id) {
      this.loadInvoicePreview(invoice.id);
    }
  }

  downloadPdf(invoice: FinanceInvoice) {
    this.finance.downloadInvoicePdf(invoice.id).subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) {
          this.error.set('This invoice does not have a PDF attached.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const filename = `${invoice.clientName?.toLowerCase().replace(/\s+/g, '-') || 'invoice'}-${invoice.id}.pdf`;
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.error.set('Unable to download invoice PDF.');
      },
    });
  }

  exportInvoices() {
    const rows = this.invoices();
    if (!rows.length) {
      this.error.set('No invoices to export.');
      return;
    }

    const header = ['Client', 'Date', 'Amount', 'Status'];
    const csv = [header, ...rows.map((row) => [
      row.clientName ?? '',
      row.invoiceDate ?? '',
      row.grandTotal ?? row.amount ?? 0,
      row.status,
    ])]
      .map((line) => line.map((value) => this.toCsv(value)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  onPdfSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const isPdf = (file.type || '').toLowerCase().includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      this.pdfError.set('Please select a PDF file.');
      return;
    }
    this.selectedPdf = file;
    this.pdfError.set('');
    this.setPdfPreviewFromBlob(file);
  }

  clearPdfSelection() {
    this.selectedPdf = null;
    this.pdfError.set('');
    this.clearPdfPreview();
  }

  totalFor(invoice: FinanceInvoice) {
    return invoice.grandTotal ?? invoice.untaxedTotal ?? invoice.amount ?? 0;
  }

  formatCurrency(amount: number | null | undefined) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0);
  }

  trackInvoice = (_: number, invoice: FinanceInvoice) => invoice.id;

  private buildItemGroup(item?: Partial<InvoiceItem>) {
    return this.fb.group({
      product: this.fb.nonNullable.control(item?.product ?? '', Validators.required),
      account: this.fb.control<string | null>(item?.account ?? ''),
      quantity: this.fb.control<number | null>(item?.quantity ?? 1, [Validators.required, Validators.min(0.01)]),
      price: this.fb.control<number | null>(item?.price ?? null, [Validators.required, Validators.min(0.01)]),
      discountPercent: this.fb.control<number | null>(item?.discountPercent ?? 0),
      taxPercent: this.fb.control<number | null>(item?.taxPercent ?? 0),
      whPercent: this.fb.control<number | null>(item?.whPercent ?? 0),
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

  private populateForm(invoice: FinanceInvoice) {
    this.form.reset({
      clientName: invoice.clientName ?? '',
      invoiceDate: invoice.invoiceDate ?? '',
    });
    this.items.clear();
    if (invoice.items?.length) {
      invoice.items.forEach((item) => this.items.push(this.buildItemGroup(item)));
    } else {
      this.items.push(this.buildItemGroup());
    }
    this.selectedPdf = null;
    this.pdfError.set('');
  }

  private loadInvoiceDetails(id: number) {
    this.finance.getInvoice(id).subscribe({
      next: (invoice) => {
        this.populateForm(invoice);
        this.editingInvoiceId.set(invoice.id);
        this.showForm.set(true);
        this.loadInvoicePreview(invoice.id);
      },
      error: () => {
        this.error.set('Unable to load invoice details.');
      },
    });
  }

  private loadInvoicePreview(id: number) {
    this.finance.downloadInvoicePdf(id).subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) {
          this.clearPdfPreview();
          return;
        }
        this.setPdfPreviewFromBlob(blob);
      },
      error: () => this.clearPdfPreview(),
    });
  }

  private setPdfPreviewFromBlob(blob: Blob) {
    this.revokePdfUrl();
    const url = URL.createObjectURL(blob);
    this.pdfObjectUrl = url;
    this.pdfPreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  private clearPdfPreview() {
    this.revokePdfUrl();
    this.pdfPreviewUrl.set(null);
  }

  private revokePdfUrl() {
    if (this.pdfObjectUrl) {
      URL.revokeObjectURL(this.pdfObjectUrl);
      this.pdfObjectUrl = null;
    }
  }

  private afterSubmit(invoice: FinanceInvoice) {
    const finalize = () => {
      this.submitting.set(false);
      this.uploadingPdf.set(false);
      this.closeForm();
    };

    if (this.selectedPdf) {
      this.uploadingPdf.set(true);
      this.finance.uploadInvoicePdf(invoice.id, this.selectedPdf).subscribe({
        next: () => {
          this.pdfError.set('');
        },
        error: (err) => {
          this.pdfError.set(err?.error?.message || 'Failed to upload PDF.');
        },
        complete: () => {
          finalize();
          this.selectedPdf = null;
        },
      });
    } else {
      finalize();
    }
  }

  private toCsv(value: unknown) {
    const str = value === null || value === undefined ? '' : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private replaceInvoice(updated: FinanceInvoice) {
    this.invoices.update((list) => list.map((inv) => (inv.id === updated.id ? updated : inv)));
  }
}
