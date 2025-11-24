import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ats-placeholder',
  standalone: true,
  template: `
    <section class="space-y-4">
      <header class="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary-600">ATS</p>
          <h1 class="text-2xl font-bold text-slate-900">Applicant Tracking Console</h1>
          <p class="text-sm text-slate-500">Embedded view of your Konecta ATS.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-primary-200 hover:text-primary-700"
            (click)="goBack()"
          >
            <span class="material-symbols-outlined text-base">arrow_back</span>
            Back to jobs
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700"
            (click)="openExternal()"
          >
            <span class="material-symbols-outlined text-base">open_in_new</span>
            Open full tab
          </button>
        </div>
      </header>

      <div class="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
        <iframe
          title="Konecta ATS"
          class="h-[78vh] w-full bg-slate-50"
          [src]="iframeSrc"
          loading="lazy"
          referrerpolicy="no-referrer"
        ></iframe>
      </div>

      <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
          <span class="material-symbols-outlined text-base">lock_open_right</span>
          Uses embedded Streamlit app
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700"
          (click)="reload()"
        >
          <span class="material-symbols-outlined text-base">refresh</span>
          Reload
        </button>
      </div>
    </section>
  `,
})
export class AtsPlaceholderComponent {
  private router = inject(Router);
  readonly atsUrl = 'https://konecta-ats-upishuzm3st3wr2erfa5mf.streamlit.app/';
  iframeSrc = this.atsUrl;

  goBack() {
    this.router.navigate(['/hr/jobs']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  openExternal() {
    window.open(this.atsUrl, '_blank', 'noopener');
  }

  reload() {
    // Force iframe reload by toggling the bound source
    this.iframeSrc = '';
    setTimeout(() => (this.iframeSrc = this.atsUrl));
  }
}
