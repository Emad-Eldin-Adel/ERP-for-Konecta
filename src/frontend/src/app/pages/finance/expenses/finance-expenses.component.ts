import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ExpenseStatus, FinanceExpense, FinanceService } from '../../../core/services/finance.service';

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
  statusFilter = signal<FilterStatus>('ALL');
  readonly statuses: FilterStatus[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

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

  trackExpense = (_: number, expense: FinanceExpense) => expense.id;
}
