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

  getPayrollOverview(period: string) {
    const params = new HttpParams().set('period', period);
    return this.http.get<PayrollOverviewRow[]>(`${this.base}/payroll/overview`, { params });
  }
}
