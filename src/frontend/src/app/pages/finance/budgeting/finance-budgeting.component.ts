import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BudgetSnapshot,
  BudgetSnapshotUpdateRequest,
  BudgetStage,
  BudgetStageState,
  BudgetStageStatus,
  BudgetStageUpdateRequest,
  BudgetCycleRequest,
  FinanceBudgetCycle,
  FinanceService,
} from '../../../core/services/finance.service';

@Component({
  selector: 'app-finance-budgeting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './finance-budgeting.component.html',
})
export class FinanceBudgetingComponent implements OnInit {
  private finance = inject(FinanceService);
  private fb = inject(FormBuilder);

  budgets = signal<FinanceBudgetCycle[]>([]);
  loading = signal(false);
  error = signal('');
  cycleError = signal('');
  stageError = signal('');
  snapshotError = signal('');
  selectedBudgetId = signal<number | null>(null);
  stageEditing = signal<BudgetStage | null>(null);
  snapshotEditing = signal<string | null>(null);
  showCycleForm = signal(false);
  savingCycle = signal(false);
  savingStage = signal(false);
  savingSnapshot = signal(false);
  editingCycleId = signal<number | null>(null);

  readonly stageStates: BudgetStageState[] = ['NOT_STARTED', 'IN_PROGRESS', 'WAITING', 'COMPLETED'];

  cycleForm = this.fb.group({
    fiscalYear: this.fb.nonNullable.control(new Date().getFullYear(), [
      Validators.required,
      Validators.min(2000),
      Validators.max(9999),
    ]),
    annualTarget: this.fb.control<number | null>(null, [Validators.min(0)]),
    approvedAmount: this.fb.control<number | null>(null, [Validators.min(0)]),
    ytdActuals: this.fb.control<number | null>(null, [Validators.min(0)]),
    latestForecast: this.fb.control<number | null>(null, [Validators.min(0)]),
    owner: this.fb.control<string | null>(''),
    notes: this.fb.control<string | null>(''),
    locked: this.fb.control(false),
  });

  stageForm = this.fb.group({
    stage: this.fb.nonNullable.control<BudgetStage>('ANNUAL_TARGET'),
    state: this.fb.nonNullable.control<BudgetStageState>('NOT_STARTED'),
    owner: this.fb.control<string | null>(''),
    notes: this.fb.control<string | null>(''),
    startedAt: this.fb.control<string | null>(''),
    completedAt: this.fb.control<string | null>(''),
  });

  snapshotForm = this.fb.group({
    month: this.fb.nonNullable.control(this.currentMonth(), Validators.required),
    budgetAmount: this.fb.control<number | null>(null),
    actualAmount: this.fb.control<number | null>(null),
    forecastAmount: this.fb.control<number | null>(null),
    notes: this.fb.control<string | null>(''),
  });

  selectedBudget = computed(
    () => this.budgets().find((budget) => budget.id === this.selectedBudgetId()) ?? null
  );

  summary = computed(() => {
    const budget = this.selectedBudget();
    if (!budget) {
      return {
        completion: 0,
        variance: 0,
        latestSnapshot: null as BudgetSnapshot | null,
      };
    }
    const total = budget.stages.length || 1;
    const completed = budget.stages.filter((stage) => stage.state === 'COMPLETED').length;
    const completion = Math.round((completed / total) * 100);
    const baseline = budget.approvedAmount ?? budget.annualTarget ?? 0;
    const variance = (budget.latestForecast ?? budget.ytdActuals ?? 0) - baseline;
    const latestSnapshot = [...budget.snapshots]
      .sort((a, b) => a.month.localeCompare(b.month))
      .pop() ?? null;
    return { completion, variance, latestSnapshot };
  });

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets() {
    this.loading.set(true);
    this.finance.getBudgets().subscribe({
      next: (list) => {
        this.budgets.set(list);
        if (list.length && !this.selectedBudgetId()) {
          this.selectedBudgetId.set(list[0].id);
        }
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to load budgets.'),
      complete: () => this.loading.set(false),
    });
  }

  selectBudget(id: number) {
    this.selectedBudgetId.set(id);
    this.stageEditing.set(null);
    this.snapshotEditing.set(null);
  }

  openCycleForm(budget?: FinanceBudgetCycle) {
    const data = budget ?? null;
    if (data) {
      this.cycleForm.reset({
        fiscalYear: data.fiscalYear,
        annualTarget: data.annualTarget,
        approvedAmount: data.approvedAmount,
        ytdActuals: data.ytdActuals,
        latestForecast: data.latestForecast,
        owner: data.owner,
        notes: data.notes,
        locked: data.isLocked,
      });
      this.editingCycleId.set(data.id);
    } else {
      this.cycleForm.reset({
        fiscalYear: new Date().getFullYear(),
        annualTarget: null,
        approvedAmount: null,
        ytdActuals: null,
        latestForecast: null,
        owner: '',
        notes: '',
        locked: false,
      });
      this.editingCycleId.set(null);
    }
    this.cycleError.set('');
    this.showCycleForm.set(true);
  }

  closeCycleForm() {
    this.showCycleForm.set(false);
    this.editingCycleId.set(null);
    this.cycleError.set('');
  }

  saveCycle() {
    if (this.cycleForm.invalid) {
      this.cycleForm.markAllAsTouched();
      return;
    }
    const raw = this.cycleForm.getRawValue();
    const payload: BudgetCycleRequest = {
      fiscalYear: raw.fiscalYear,
      annualTarget: this.normalizeNumber(raw.annualTarget),
      approvedAmount: this.normalizeNumber(raw.approvedAmount),
      ytdActuals: this.normalizeNumber(raw.ytdActuals),
      latestForecast: this.normalizeNumber(raw.latestForecast),
      owner: this.cleanText(raw.owner),
      notes: this.cleanText(raw.notes),
      locked: raw.locked ?? false,
    };
    this.savingCycle.set(true);
    this.cycleError.set('');
    const request$ = this.editingCycleId()
      ? this.finance.updateBudget(this.editingCycleId()!, payload)
      : this.finance.createBudget(payload);
    request$.subscribe({
      next: (budget) => {
        this.upsertBudget(budget);
        this.selectedBudgetId.set(budget.id);
        this.showCycleForm.set(false);
        this.editingCycleId.set(null);
      },
      error: (err) => this.cycleError.set(err?.error?.message || 'Unable to save budget cycle.'),
      complete: () => this.savingCycle.set(false),
    });
  }

  editStage(stage: BudgetStageStatus) {
    this.stageEditing.set(stage.stage);
    this.stageForm.reset({
      stage: stage.stage,
      state: stage.state,
      owner: stage.owner,
      notes: stage.notes,
      startedAt: stage.startedAt ? stage.startedAt.substring(0, 10) : '',
      completedAt: stage.completedAt ? stage.completedAt.substring(0, 10) : '',
    });
    this.stageError.set('');
  }

  cancelStageEdit() {
    this.stageEditing.set(null);
    this.stageForm.reset({
      stage: 'ANNUAL_TARGET',
      state: 'NOT_STARTED',
      owner: '',
      notes: '',
      startedAt: '',
      completedAt: '',
    });
    this.stageError.set('');
  }

  saveStage() {
    const budget = this.selectedBudget();
    if (!budget) return;
    const raw = this.stageForm.getRawValue();
    if (!raw.stage) return;
    const payload: BudgetStageUpdateRequest = {
      stage: raw.stage,
      state: raw.state,
      owner: this.cleanText(raw.owner),
      notes: this.cleanText(raw.notes),
      startedAt: raw.startedAt || null,
      completedAt: raw.completedAt || null,
    };
    this.savingStage.set(true);
    this.stageError.set('');
    this.finance.updateBudgetStage(budget.id, payload).subscribe({
      next: (stage) => {
        this.applyStage(stage);
        this.cancelStageEdit();
      },
      error: (err) => this.stageError.set(err?.error?.message || 'Unable to update stage.'),
      complete: () => this.savingStage.set(false),
    });
  }

  startSnapshot(snapshot?: BudgetSnapshot) {
    if (snapshot) {
      this.snapshotEditing.set(snapshot.month);
      this.snapshotForm.reset({
        month: snapshot.month,
        budgetAmount: snapshot.budgetAmount,
        actualAmount: snapshot.actualAmount,
        forecastAmount: snapshot.forecastAmount,
        notes: snapshot.notes,
      });
    } else {
      this.snapshotEditing.set(null);
      this.snapshotForm.reset({
        month: this.currentMonth(),
        budgetAmount: null,
        actualAmount: null,
        forecastAmount: null,
        notes: '',
      });
    }
    const control = this.snapshotForm.controls.month;
    if (snapshot) {
      control.disable();
    } else {
      control.enable();
    }
    this.snapshotError.set('');
  }

  cancelSnapshotEdit() {
    this.snapshotEditing.set(null);
    this.snapshotForm.controls.month.enable();
    this.snapshotForm.reset({
      month: this.currentMonth(),
      budgetAmount: null,
      actualAmount: null,
      forecastAmount: null,
      notes: '',
    });
    this.snapshotError.set('');
  }

  saveSnapshot() {
    const budget = this.selectedBudget();
    if (!budget) return;
    if (this.snapshotForm.invalid) {
      this.snapshotForm.markAllAsTouched();
      return;
    }
    const raw = this.snapshotForm.getRawValue();
    const payload: BudgetSnapshotUpdateRequest = {
      month: raw.month,
      budgetAmount: this.normalizeNumber(raw.budgetAmount),
      actualAmount: this.normalizeNumber(raw.actualAmount),
      forecastAmount: this.normalizeNumber(raw.forecastAmount),
      notes: this.cleanText(raw.notes),
    };
    this.savingSnapshot.set(true);
    this.snapshotError.set('');
    this.finance.upsertBudgetSnapshot(budget.id, payload).subscribe({
      next: (snapshot) => {
        this.applySnapshot(snapshot);
        this.cancelSnapshotEdit();
      },
      error: (err) =>
        this.snapshotError.set(err?.error?.message || 'Unable to save monthly snapshot.'),
      complete: () => this.savingSnapshot.set(false),
    });
  }

  stateClasses(state: BudgetStageState) {
    switch (state) {
      case 'COMPLETED':
        return 'border-emerald-200 bg-emerald-50 text-emerald-600';
      case 'IN_PROGRESS':
        return 'border-primary-200 bg-primary-50 text-primary-600';
      case 'WAITING':
        return 'border-amber-200 bg-amber-50 text-amber-600';
      default:
        return 'border-slate-200 bg-white text-slate-500';
    }
  }

  formatMonth(value: string | null) {
    if (!value) return '—';
    const safe = value.length === 7 ? `${value}-01` : value;
    const date = new Date(safe);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString(undefined, { month: 'short', year: 'numeric' });
  }

  private currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private normalizeNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private cleanText(value: string | null | undefined) {
    if (!value) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  private upsertBudget(budget: FinanceBudgetCycle) {
    this.budgets.update((list) => {
      const next = list.filter((item) => item.id !== budget.id);
      next.push(budget);
      next.sort((a, b) => {
        if (a.fiscalYear === b.fiscalYear) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return b.fiscalYear - a.fiscalYear;
      });
      return next;
    });
  }

  private applyStage(stage: BudgetStageStatus) {
    const nowIso = new Date().toISOString();
    this.budgets.update((list) =>
      list.map((budget) => {
        if (budget.id !== this.selectedBudgetId()) {
          return budget;
        }
        const stages = budget.stages.some((item) => item.stage === stage.stage)
          ? budget.stages.map((item) => (item.stage === stage.stage ? stage : item))
          : [...budget.stages, stage];
        return { ...budget, stages, updatedAt: nowIso };
      })
    );
  }

  private applySnapshot(snapshot: BudgetSnapshot) {
    const nowIso = new Date().toISOString();
    this.budgets.update((list) =>
      list.map((budget) => {
        if (budget.id !== this.selectedBudgetId()) {
          return budget;
        }
        const snapshots = budget.snapshots.some((item) => item.month === snapshot.month)
          ? budget.snapshots.map((item) => (item.month === snapshot.month ? snapshot : item))
          : [...budget.snapshots, snapshot];
        snapshots.sort((a, b) => a.month.localeCompare(b.month));
        return { ...budget, snapshots, updatedAt: nowIso };
      })
    );
  }

  stageCompletion(budget: FinanceBudgetCycle) {
    const total = budget.stages.length || 1;
    const completed = budget.stages.filter((stage) => stage.state === 'COMPLETED').length;
    return Math.round((completed / total) * 100);
  }
}
