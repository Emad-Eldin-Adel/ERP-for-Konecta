import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ats-placeholder',
  standalone: true,
  template: `
    <section class="relative overflow-hidden rounded-3xl border border-slate-800/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
      <div class="absolute -left-12 -top-10 h-40 w-40 rounded-full bg-primary-500/30 blur-3xl"></div>
      <div class="absolute -right-10 -bottom-14 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl"></div>
      <div class="relative grid items-center gap-8 p-8 md:grid-cols-2">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.4em] text-primary-200/80">404 / ATS</p>
          <h1 class="mt-3 text-4xl font-black">Applicant Tracking is still taxiing</h1>
          <p class="mt-3 max-w-xl text-sm text-slate-200/90">
            The runway for our ATS hasn't cleared yet. We'll ping you when the automations, scorecards,
            and candidate flow are ready to launch. Until then, keep fueling your reqs from the Jobs board.
          </p>
          <div class="mt-5 flex flex-wrap gap-3 text-sm">
            <button
              class="rounded-full bg-white px-4 py-2 font-semibold text-slate-900 shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-500/40"
              type="button"
              (click)="goBack()"
            >
              Return to jobs
            </button>
            <button
              class="rounded-full border border-white/30 px-4 py-2 font-semibold text-white/90 hover:border-white hover:text-white"
              type="button"
              (click)="goHome()"
            >
              Back to home
            </button>
          </div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-100">Signal Log</p>
          <div class="mt-4 space-y-3 text-sm">
            <div class="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">4</span>
              <div>
                <p class="font-semibold">Endpoint missing</p>
                <p class="text-slate-200/80">ATS destination not found. Re-routing to a safe spot.</p>
              </div>
            </div>
            <div class="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">0</span>
              <div>
                <p class="font-semibold">Workflow paused</p>
                <p class="text-slate-200/80">Candidate pipeline automation will resume once the module touches down.</p>
              </div>
            </div>
            <div class="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">4</span>
              <div>
                <p class="font-semibold">Visibility</p>
                <p class="text-slate-200/80">You're still clear to track requisitions and hiring signals from Jobs.</p>
              </div>
            </div>
          </div>
          <div class="mt-4 flex items-center gap-3 text-xs text-primary-100/80">
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
            Watching for ATS coordinates...
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AtsPlaceholderComponent {
  private router = inject(Router);

  goBack() {
    this.router.navigate(['/hr/jobs']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}

