import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';

const NAV_ITEMS = [
  { label: 'Overview', path: '/finance/overview', icon: 'monitoring' },
  { label: 'Budgeting', path: '/finance/budgeting', icon: 'account_tree' },
  { label: 'Expenses', path: '/finance/expenses', icon: 'receipt' },
  { label: 'Invoices', path: '/finance/invoices', icon: 'contract_edit' },
  { label: 'Payroll', path: '/finance/payroll', icon: 'payments' },
];

@Component({
  selector: 'app-finance-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor],
  template: `
    <section class="space-y-6">
      <header class="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.4em] text-primary-500">Finance</p>
        <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Financial Operations</h1>
            <p class="text-sm text-slate-500">
              Monitor cash flow, approve spending, and keep billing current.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 shadow-inner shadow-primary-200/60 transition hover:bg-primary-100"
          >
            <span class="material-symbols-outlined text-base">auto_awesome</span>
            AI-powered Financial Forecasting
          </button>
        </div>
        <nav class="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-500">
          <a
            *ngFor="let item of nav"
            [routerLink]="item.path"
            routerLinkActive="bg-primary-100 text-primary-700 shadow-lg shadow-primary-500/30 border border-primary-200"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 transition hover:border-primary-200 hover:text-primary-600"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <span class="material-symbols-outlined text-base">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        </nav>
      </header>
      <router-outlet></router-outlet>
    </section>
  `,
})
export class FinanceShellComponent {
  nav = NAV_ITEMS;
}
