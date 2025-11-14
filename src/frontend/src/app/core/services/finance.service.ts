import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID';

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
}
