import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import {
  ExpenseStatus,
  FinanceExpense,
  FinanceService,
  ImportSummary,
} from '../../../core/services/finance.service';

type FilterStatus = 'ALL' | ExpenseStatus;

@Component({
  selector: 'app-finance-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './finance-expenses.component.html',
})
export class FinanceExpensesComponent implements OnInit {
  private finance = inject(FinanceService);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  expenses = signal<FinanceExpense[]>([]);
  loading = signal(false);
  submitting = signal(false);
  error = signal('');
  formError = signal('');
  showForm = signal(false);
  showImport = signal(false);
  importing = signal(false);
  importError = signal('');
  importSummary = signal<ImportSummary | null>(null);
  importFile = signal<File | null>(null);
  importStatus = signal<ExpenseStatus>('APPROVED');
  importDateFormat = signal('M/d/yyyy');
  importMode = signal<'upsert' | 'insert_only'>('upsert');
  statusFilter = signal<FilterStatus>('ALL');
  readonly statuses: FilterStatus[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
  readonly importStatuses: ExpenseStatus[] = ['APPROVED', 'PENDING'];
  readonly importModes: Array<'upsert' | 'insert_only'> = ['upsert', 'insert_only'];
  readonly pageSizeOptions = [5, 10, 20] as const;
  page = signal(1);
  pageSize = signal<(typeof this.pageSizeOptions)[number]>(10);

  form = this.fb.group({
    category: this.fb.nonNullable.control('', Validators.required),
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    description: this.fb.control<string>(''),
    department: this.fb.control<string>(''),
    expenseDate: this.fb.control<string>(''),
  });

  counts = computed(() => {
    const list = this.expenses();
    return {
      total: list.length,
      pending: list.filter((e) => e.status === 'PENDING').length,
      approved: list.filter((e) => e.status === 'APPROVED').length,
      rejected: list.filter((e) => e.status === 'REJECTED').length,
    };
  });

  filteredExpenses = computed(() => {
    const filter = this.statusFilter();
    if (filter === 'ALL') {
      return this.expenses();
    }
    return this.expenses().filter((exp) => exp.status === filter);
  });

  totalPages = computed(() => {
    const size = this.pageSize();
    const total = this.filteredExpenses().length;
    return Math.max(1, Math.ceil(total / size || 1));
  });

  paginatedExpenses = computed(() => {
    const list = this.filteredExpenses();
    const size = this.pageSize();
    const current = Math.min(this.page(), this.totalPages());
    const start = (current - 1) * size;
    return list.slice(start, start + size);
  });

  pageInfo = computed(() => {
    const total = this.filteredExpenses().length;
    if (!total) {
      return '0 of 0';
    }
    const size = this.pageSize();
    const current = Math.min(this.page(), this.totalPages());
    const start = (current - 1) * size + 1;
    const end = Math.min(current * size, total);
    return `${start}-${end} of ${total}`;
  });

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses() {
    this.loading.set(true);
    const filter = this.statusFilter();
    this.finance.getExpenses(filter === 'ALL' ? undefined : filter).subscribe({
      next: (data) => {
        this.expenses.set(data);
        this.error.set('');
        this.page.set(1);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to load expenses.');
      },
      complete: () => this.loading.set(false),
    });
  }

  changeFilter(status: FilterStatus) {
    if (this.statusFilter() === status) return;
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadExpenses();
  }

  openForm() {
    this.form.reset();
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.form.reset();
    this.formError.set('');
  }

  submitExpense() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload = {
      submittedBy: this.auth.currentUser?.id ?? null,
      category: value.category ?? '',
      amount: Number(value.amount ?? 0),
      description: value.description?.trim() || null,
      department: value.department?.trim() || null,
      expenseDate: value.expenseDate || null,
    };
    this.submitting.set(true);
    this.finance.submitExpense(payload).subscribe({
      next: (expense) => {
        this.expenses.update((list) => [expense, ...list]);
        this.closeForm();
      },
      error: (err) => {
        this.formError.set(err?.error?.message || 'Unable to submit expense.');
      },
      complete: () => this.submitting.set(false),
    });
  }

  approve(expense: FinanceExpense) {
    if (!confirm(`Approve ${expense.category || 'expense'} for ${this.formatCurrency(expense.amount)}?`)) {
      return;
    }
    const approverId = this.auth.currentUser?.id ?? 0;
    this.finance.approveExpense(expense.id, approverId).subscribe({
      next: (updated) => {
        this.expenses.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
      },
      error: (err) => (this.error.set(err?.error?.message || 'Unable to approve expense.')),
    });
  }

  reject(expense: FinanceExpense) {
    if (!confirm(`Reject ${expense.category || 'expense'}?`)) {
      return;
    }
    const approverId = this.auth.currentUser?.id ?? 0;
    this.finance.rejectExpense(expense.id, approverId).subscribe({
      next: (updated) => {
        this.expenses.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
      },
      error: (err) => (this.error.set(err?.error?.message || 'Unable to reject expense.')),
    });
  }

  formatCurrency(amount: number | null | undefined) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0);
  }

  exportExpenses() {
    const rows = this.expenses();
    if (!rows.length) {
      this.error.set('No expenses to export.');
      return;
    }

    const header = ['Department', 'Expense Date', 'Category', 'Amount', 'Status', 'Description'];
    const csv = [header, ...rows.map((r) => [
      r.department || '',
      r.expenseDate || '',
      r.category || '',
      r.amount ?? 0,
      r.status,
      r.description || '',
    ])]
      .map((line) => line.map((value) => this.toCsv(value)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  openImportPanel() {
    this.showImport.set(true);
    this.importError.set('');
  }

  closeImportPanel() {
    this.showImport.set(false);
    this.importFile.set(null);
    this.importSummary.set(null);
    this.importError.set('');
    this.importing.set(false);
  }

  onImportFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    this.importFile.set(file);
    this.importSummary.set(null);
  }

  startImport() {
    const file = this.importFile();
    if (!file) {
      this.importError.set('Select a file to import.');
      return;
    }

    this.importing.set(true);
    this.importError.set('');
    this.finance
      .importExpenses(file, {
        status: this.importStatus(),
        dateFormat: this.importDateFormat(),
        mode: this.importMode(),
      })
      .subscribe({
        next: (summary) => {
          this.importSummary.set(summary);
          this.statusFilter.set('ALL');
          this.loadExpenses();
        },
        error: (err) => {
          this.importError.set(err?.error?.message || 'Unable to import expenses.');
        },
        complete: () => {
          this.importing.set(false);
          this.importFile.set(null);
        },
      });
  }

  changePageSize(size: number | string) {
    const parsed = Number(size) as (typeof this.pageSizeOptions)[number];
    if (!this.pageSizeOptions.includes(parsed) || this.pageSize() === parsed) return;
    this.pageSize.set(parsed);
    this.page.set(1);
  }

  nextPage() {
    if (this.page() >= this.totalPages()) return;
    this.page.update((value) => value + 1);
  }

  prevPage() {
    if (this.page() <= 1) return;
    this.page.update((value) => value - 1);
  }

  setImportStatus(value: string) {
    this.importStatus.set(value as ExpenseStatus);
  }

  setImportMode(value: string) {
    this.importMode.set(value as 'upsert' | 'insert_only');
  }

  trackExpense = (_: number, expense: FinanceExpense) => expense.id;

  private toCsv(value: unknown) {
    const str = value === null || value === undefined ? '' : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
