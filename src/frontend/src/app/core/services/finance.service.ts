import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID';
export type BudgetStage =
  | 'ANNUAL_TARGET'
  | 'DEPARTMENT_PROPOSALS'
  | 'CONSOLIDATION_REVIEW'
  | 'HISTORICAL_COMPARISON'
  | 'FINAL_APPROVAL'
  | 'SYSTEM_UPLOAD_LOCK'
  | 'MONTHLY_TRACKING'
  | 'FORECAST_REALLOCATION';
export type BudgetStageState = 'NOT_STARTED' | 'IN_PROGRESS' | 'WAITING' | 'COMPLETED';

export interface FinanceExpense {
  id: number;
  submittedBy: number | null;
  category: string | null;
  amount: number;
  description: string | null;
  status: ExpenseStatus;
  approvedBy: number | null;
  createdAt: string;
  department: string | null;
  expenseDate: string | null;
}

export interface ExpenseRequest {
  submittedBy: number | null;
  category: string;
  amount: number;
  description: string | null;
  department?: string | null;
  expenseDate?: string | null;
}

export interface InvoiceItem {
  id?: number;
  product: string | null;
  account: string | null;
  dueDate: string | null;
  quantity: number | null;
  price: number | null;
  discountPercent: number | null;
  taxPercent: number | null;
  whPercent: number | null;
  baseAmount?: number | null;
  taxAmount?: number | null;
  withholding?: number | null;
  lineTotal?: number | null;
}

export interface FinanceInvoice {
  id: number;
  clientName: string;
  invoiceDate: string | null;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
  untaxedTotal: number | null;
  taxTotal: number | null;
  withholdingTotal: number | null;
  grandTotal: number | null;
  items: InvoiceItem[];
  pdfAttached: boolean;
}

export interface InvoiceRequest {
  clientName: string;
  invoiceDate: string | null;
  items: InvoiceItem[];
}

export interface PayrollOverviewRow {
  employeeId: number;
  name: string | null;
  base: number;
  bonuses: number;
  deductions: number;
  net: number;
  paid: boolean;
  accountMasked: string | null;
  cardType: string | null;
}

export interface PayrollRecord {
  id: number;
  employeeId: number;
  period: string;
  baseSalary: number | null;
  bonuses: number | null;
  deductions: number | null;
  netSalary: number | null;
  processedDate: string | null;
}

export interface PayrollCalculationRequest {
  employeeId: number;
  period: string;
  baseSalary?: number | null;
  bonuses?: number | null;
  deductions?: number | null;
}

export interface ImportSummary {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface BudgetStageStatus {
  id: number;
  stage: BudgetStage;
  label: string;
  state: BudgetStageState;
  owner: string | null;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface BudgetSnapshot {
  id: number;
  month: string;
  budgetAmount: number | null;
  actualAmount: number | null;
  forecastAmount: number | null;
  variance: number | null;
  notes: string | null;
}

export interface FinanceBudgetCycle {
  id: number;
  fiscalYear: number;
  annualTarget: number | null;
  approvedAmount: number | null;
  ytdActuals: number | null;
  latestForecast: number | null;
  isLocked: boolean;
  lockedAt: string | null;
  owner: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  stages: BudgetStageStatus[];
  snapshots: BudgetSnapshot[];
}

export interface BudgetCycleRequest {
  fiscalYear: number;
  annualTarget?: number | null;
  approvedAmount?: number | null;
  ytdActuals?: number | null;
  latestForecast?: number | null;
  owner?: string | null;
  notes?: string | null;
  locked?: boolean;
  stages?: BudgetStageUpdateRequest[];
  snapshots?: BudgetSnapshotUpdateRequest[];
}

export interface BudgetStageUpdateRequest {
  stage: BudgetStage;
  state: BudgetStageState;
  owner?: string | null;
  notes?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface BudgetSnapshotUpdateRequest {
  month: string;
  budgetAmount?: number | null;
  actualAmount?: number | null;
  forecastAmount?: number | null;
  notes?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/finance`;

  getExpenses(status?: ExpenseStatus) {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<FinanceExpense[]>(`${this.base}/expenses`, { params });
  }

  submitExpense(payload: ExpenseRequest) {
    return this.http.post<FinanceExpense>(`${this.base}/expenses`, payload);
  }

  importExpenses(
    file: File,
    options?: { status?: ExpenseStatus; dateFormat?: string; mode?: 'upsert' | 'insert_only' }
  ) {
    let params = new HttpParams();
    if (options?.status) {
      params = params.set('status', options.status);
    }
    if (options?.dateFormat) {
      params = params.set('dateFormat', options.dateFormat);
    }
    if (options?.mode) {
      params = params.set('mode', options.mode);
    }

    return this.http.post<ImportSummary>(`${this.base}/expenses/import-bin`, file, {
      params,
      headers: { 'X-Filename': file.name || 'expenses-import' },
    });
  }

  approveExpense(id: number, approverId: number) {
    const params = new HttpParams().set('approverId', approverId);
    return this.http.put<FinanceExpense>(`${this.base}/expenses/${id}/approve`, null, { params });
  }

  rejectExpense(id: number, approverId: number) {
    const params = new HttpParams().set('approverId', approverId);
    return this.http.put<FinanceExpense>(`${this.base}/expenses/${id}/reject`, null, { params });
  }

  getInvoices(status?: InvoiceStatus) {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<FinanceInvoice[]>(`${this.base}/invoices`, { params });
  }

  getInvoice(id: number) {
    return this.http.get<FinanceInvoice>(`${this.base}/invoices/${id}`);
  }

  createInvoice(payload: InvoiceRequest) {
    return this.http.post<FinanceInvoice>(`${this.base}/invoices`, payload);
  }

  updateInvoice(id: number, payload: InvoiceRequest) {
    return this.http.put<FinanceInvoice>(`${this.base}/invoices/${id}`, payload);
  }

  sendInvoice(id: number) {
    return this.http.put<FinanceInvoice>(`${this.base}/invoices/${id}/send`, null);
  }

  markInvoicePaid(id: number) {
    return this.http.put<FinanceInvoice>(`${this.base}/invoices/${id}/mark-paid`, null);
  }

  uploadInvoicePdf(id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<void>(`${this.base}/invoices/${id}/pdf`, formData);
  }

  downloadInvoicePdf(id: number) {
    return this.http.get(`${this.base}/invoices/${id}/pdf`, { responseType: 'blob' });
  }

  getPayrollOverview(period: string) {
    const params = new HttpParams().set('period', period);
    return this.http.get<PayrollOverviewRow[]>(`${this.base}/payroll/overview`, { params });
  }

  calculatePayroll(payload: PayrollCalculationRequest) {
    return this.http.post<PayrollRecord>(`${this.base}/payroll`, payload);
  }

  getBudgets() {
    return this.http.get<FinanceBudgetCycle[]>(`${this.base}/budgets`);
  }

  getBudget(id: number) {
    return this.http.get<FinanceBudgetCycle>(`${this.base}/budgets/${id}`);
  }

  createBudget(payload: BudgetCycleRequest) {
    return this.http.post<FinanceBudgetCycle>(`${this.base}/budgets`, payload);
  }

  updateBudget(id: number, payload: BudgetCycleRequest) {
    return this.http.put<FinanceBudgetCycle>(`${this.base}/budgets/${id}`, payload);
  }

  updateBudgetStage(id: number, payload: BudgetStageUpdateRequest) {
    return this.http.put<BudgetStageStatus>(`${this.base}/budgets/${id}/stages`, payload);
  }

  upsertBudgetSnapshot(id: number, payload: BudgetSnapshotUpdateRequest) {
    return this.http.put<BudgetSnapshot>(`${this.base}/budgets/${id}/snapshots`, payload);
  }
}
