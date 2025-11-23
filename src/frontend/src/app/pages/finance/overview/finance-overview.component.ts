import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FinanceExpense, FinanceInvoice, FinanceService, PayrollOverviewRow } from '../../../core/services/finance.service';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-finance-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance-overview.component.html',
})
export class FinanceOverviewComponent implements OnInit {
  private finance = inject(FinanceService);
  private sanitizer = inject(DomSanitizer);

  expenses = signal<FinanceExpense[]>([]);
  invoices = signal<FinanceInvoice[]>([]);
  payroll = signal<PayrollOverviewRow[]>([]);
  loading = signal(false);
  payrollLoading = signal(false);
  error = signal('');
  period = signal(this.getCurrentPeriod());
  powerBiUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://app.powerbi.com/reportEmbed?reportId=e60d1ad1-c507-469e-b3d4-a96948ed8505&autoAuth=true&ctid=6845d6ca-1ec5-4c0e-9e9d-34130ce0a0b8'
  );

  summary = computed(() => {
    const expenses = this.expenses();
    const invoices = this.invoices();
    const payroll = this.payroll();
    const spent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const pending = expenses
      .filter((exp) => exp.status === 'PENDING')
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const draftInvoices = invoices.filter((inv) => inv.status === 'DRAFT').length;
    const receivables = invoices
      .filter((inv) => inv.status !== 'PAID')
      .reduce((sum, inv) => sum + (inv.grandTotal ?? inv.amount ?? 0), 0);
    const payrollTotal = payroll.reduce((sum, row) => sum + (row.net || 0), 0);
    const payrollPaid = payroll
      .filter((row) => row.paid)
      .reduce((sum, row) => sum + (row.net || 0), 0);
    return {
      spent,
      pending,
      draftInvoices,
      receivables,
      payrollCoverage: payrollTotal ? Math.round((payrollPaid / payrollTotal) * 100) : 0,
    };
  });

  topExpenses = computed(() =>
    [...this.expenses()]
      .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
      .slice(0, 5)
  );

  recentInvoices = computed(() =>
    [...this.invoices()]
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      .slice(0, 5)
  );

  payrollPreview = computed(() => this.payroll().slice(0, 5));

  ngOnInit(): void {
    this.loadOverview();
  }

  refreshPeriod(value: string) {
    if (!value) return;
    this.period.set(value);
    this.loadPayrollOnly();
  }

  loadOverview() {
    this.loading.set(true);
    forkJoin({
      expenses: this.finance.getExpenses(),
      invoices: this.finance.getInvoices(),
      payroll: this.finance.getPayrollOverview(this.period()),
    }).subscribe({
      next: ({ expenses, invoices, payroll }) => {
        this.expenses.set(expenses);
        this.invoices.set(invoices);
        this.payroll.set(payroll);
        this.error.set('');
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to load finance data.');
      },
      complete: () => this.loading.set(false),
    });
  }

  private loadPayrollOnly() {
    this.payrollLoading.set(true);
    this.finance.getPayrollOverview(this.period()).subscribe({
      next: (rows) => {
        this.payroll.set(rows);
        this.error.set('');
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to load payroll data.');
      },
      complete: () => this.payrollLoading.set(false),
    });
  }

  formatCurrency(amount: number | null | undefined) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0);
  }

  trackExpense = (_: number, expense: FinanceExpense) => expense.id;
  trackInvoice = (_: number, invoice: FinanceInvoice) => invoice.id;
  trackPayroll = (_: number, row: PayrollOverviewRow) => row.employeeId;

  private getCurrentPeriod() {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
  }
}
