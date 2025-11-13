import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FinanceService, PayrollOverviewRow } from '../../../core/services/finance.service';

type PayrollFilter = 'ALL' | 'PAID' | 'PENDING';

@Component({
  selector: 'app-finance-payroll',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-payroll.component.html',
})
export class FinancePayrollComponent implements OnInit {
  private finance = inject(FinanceService);

  rows = signal<PayrollOverviewRow[]>([]);
  loading = signal(false);
  error = signal('');
  period = signal(this.currentPeriod());
  filter = signal<PayrollFilter>('ALL');
  readonly filters: PayrollFilter[] = ['ALL', 'PAID', 'PENDING'];

  totals = computed(() => {
    const list = this.rows();
    const paid = list.filter((row) => row.paid).reduce((sum, row) => sum + (row.net || 0), 0);
    const pending = list.filter((row) => !row.paid).reduce((sum, row) => sum + (row.net || 0), 0);
    const count = list.length;
    return { paid, pending, count };
  });

  filteredRows = computed(() => {
    const filter = this.filter();
    if (filter === 'ALL') return this.rows();
    return this.rows().filter((row) => (filter === 'PAID' ? row.paid : !row.paid));
  });

  ngOnInit(): void {
    this.loadRows();
  }

  loadRows() {
    this.loading.set(true);
    this.finance.getPayrollOverview(this.period()).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to load payroll.'),
      complete: () => this.loading.set(false),
    });
  }

  changeFilter(filter: PayrollFilter) {
    this.filter.set(filter);
  }

  updatePeriod(value: string) {
    if (!value) return;
    this.period.set(value);
    this.loadRows();
  }

  formatCurrency(amount: number | null | undefined) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0);
  }

  trackRow = (_: number, row: PayrollOverviewRow) => row.employeeId;

  private currentPeriod() {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
  }
}
