import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgClass, NgFor } from '@angular/common';

const NAV_ITEMS = [
  { label: 'People', path: '/hr/employees', icon: 'group' },
  { label: 'Departments', path: '/hr/departments', icon: 'business' },
  { label: 'Jobs', path: '/hr/jobs', icon: 'work' },
  { label: 'ATS', path: '/hr/ats', icon: 'rocket_launch' },
  { label: 'Leave', path: '/hr/leave', icon: 'event_available' },
  { label: 'Attendance', path: '/hr/attendance', icon: 'calendar_month' },
  { label: 'Performance', path: '/hr/performance', icon: 'workspace_premium' },
  { label: 'Training', path: '/hr/training', icon: 'school' },
  { label: 'Offboarding', path: '/hr/offboarding', icon: 'assignment_return' },
];

@Component({
  selector: 'app-hr-shell',
  standalone: true,
  template: `
    <section class="space-y-6">
      <header class="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.4em] text-primary-500">HR Workspace</p>
        <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Operations Control</h1>
            <p class="text-sm text-slate-500">Manage people programs, compliance, and growth initiatives.</p>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <nav class="flex flex-wrap gap-2 text-sm font-semibold text-slate-500">
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
          <a
            *ngIf="isEmployeesSection()"
            href="https://konecta-hr-attrition-mghuazw9grjizwkgzqv57n.streamlit.app/"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-700"
          >
            <span class="material-symbols-outlined text-base">trending_up</span>
            Employees retention
          </a>
        </div>
      </header>
      <router-outlet></router-outlet>
    </section>
  `,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgClass],
})
export class HrShellComponent {
  private router = inject(Router);
  nav = NAV_ITEMS;

  isEmployeesSection() {
    return this.router.url.startsWith('/hr/employees');
  }
}
