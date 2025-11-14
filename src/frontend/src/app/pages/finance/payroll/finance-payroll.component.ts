import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  FinanceService,
  PayrollOverviewRow,
  PayrollRecord,
} from '../../../core/services/finance.service';

type PayrollFilter = 'ALL' | 'PAID' | 'PENDING';
type PayrollRow = PayrollOverviewRow & { selected: boolean };

@Component({
  selector: 'app-finance-payroll',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-payroll.component.html',
})
export class FinancePayrollComponent implements OnInit {
  private finance = inject(FinanceService);

  rows = signal<PayrollRow[]>([]);
  loading = signal(false);
  error = signal('');
  period = signal(this.currentPeriod());
  filter = signal<PayrollFilter>('ALL');
  search = signal('');
  bulkPaying = signal(false);
  payingEmployeeId = signal<number | null>(null);
  importMessage = signal('');
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
    const term = this.search().trim().toLowerCase();
    return this.rows().filter((row) => {
      const matchesFilter =
        filter === 'ALL' ? true : filter === 'PAID' ? row.paid : !row.paid;
      const matchesSearch =
        !term ||
        `${row.employeeId}`.includes(term) ||
        (row.name || '').toLowerCase().includes(term) ||
        (row.accountMasked || '').toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  });

  anySelected = computed(() =>
    this.filteredRows().some((row) => row.selected && !row.paid)
  );

  allSelectableSelected = computed(() => {
    const candidates = this.filteredRows().filter((row) => !row.paid);
    if (!candidates.length) return false;
    return candidates.every((row) => row.selected);
  });

  selectedCount = computed(
    () => this.filteredRows().filter((row) => row.selected && !row.paid).length
  );

  hasPendingFilteredRows = computed(() =>
    this.filteredRows().some((row) => !row.paid)
  );

  ngOnInit(): void {
    this.loadRows();
  }

  loadRows() {
    this.loading.set(true);
    this.finance.getPayrollOverview(this.period()).subscribe({
      next: (rows) => {
        this.rows.set(rows.map((row) => this.normalizeRow(row)));
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

  updateSearch(value: string) {
    this.search.set(value);
  }

  toggleRowSelection(employeeId: number, selected: boolean) {
    this.updateRow(employeeId, (row) => ({
      ...row,
      selected: selected && !row.paid,
    }));
  }

  toggleAll(flag: boolean) {
    const selectable = new Set(
      this.filteredRows().filter((row) => !row.paid).map((row) => row.employeeId)
    );
    this.rows.update((rows) =>
      rows.map((row) => (selectable.has(row.employeeId) ? { ...row, selected: flag } : row))
    );
  }

  updateValue(
    employeeId: number,
    field: 'base' | 'bonuses' | 'deductions',
    rawValue: string
  ) {
    const parsed = Number(rawValue);
    this.updateRow(employeeId, (row) => {
      const safeValue = Number.isFinite(parsed) ? parsed : 0;
      const updated: PayrollRow = { ...row, [field]: safeValue };
      updated.net = this.calcNet(updated.base, updated.bonuses, updated.deductions);
      if (row.paid) {
        updated.paid = false;
      }
      return updated;
    });
  }

  payRow(row: PayrollRow) {
    if (row.paid) {
      return;
    }
    this.payingEmployeeId.set(row.employeeId);
    this.finance.calculatePayroll(this.buildPayload(row)).subscribe({
      next: (saved) => {
        this.applyPayrollResult(row.employeeId, saved);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to process payroll.'),
      complete: () => this.payingEmployeeId.set(null),
    });
  }

  async paySelected() {
    const targets = this.filteredRows().filter((row) => row.selected && !row.paid);
    if (!targets.length) return;
    this.bulkPaying.set(true);
    try {
      for (const row of targets) {
        const saved = await firstValueFrom(this.finance.calculatePayroll(this.buildPayload(row)));
        this.applyPayrollResult(row.employeeId, saved);
      }
      this.error.set('');
    } catch {
      this.error.set('Unable to pay selected employees.');
    } finally {
      this.bulkPaying.set(false);
    }
  }

  exportPayroll() {
    const rows = this.rows();
    if (!rows.length) {
      this.error.set('No payroll data to export.');
      return;
    }
    const header = ['Employee', 'Base', 'Bonuses', 'Deductions', 'Net', 'Status'];
    const csv = [header, ...rows.map((row) => [
      row.name || `#${row.employeeId}`,
      row.base,
      row.bonuses,
      row.deductions,
      row.net,
      row.paid ? 'PAID' : 'PENDING',
    ])]
      .map((line) => line.map((value) => this.toCsv(value)).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll-${this.period()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.importMessage.set('');
    try {
      const text = await file.text();
      const { updated, skipped } = this.applyImport(text);
      this.importMessage.set(`Updated ${updated} row(s). ${skipped} skipped.`);
    } catch {
      this.importMessage.set('Unable to import file.');
    } finally {
      input.value = '';
    }
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

  private normalizeRow(row: PayrollOverviewRow): PayrollRow {
    const base = row.base ?? 0;
    const bonuses = row.bonuses ?? 0;
    const deductions = row.deductions ?? 0;
    const net = row.net ?? this.calcNet(base, bonuses, deductions);
    return { ...row, base, bonuses, deductions, net, selected: false };
  }

  private updateRow(employeeId: number, updater: (row: PayrollRow) => PayrollRow) {
    this.rows.update((rows) =>
      rows.map((row) => (row.employeeId === employeeId ? updater({ ...row }) : row))
    );
  }

  private calcNet(base: number, bonuses: number, deductions: number) {
    return (base || 0) + (bonuses || 0) - (deductions || 0);
  }

  private buildPayload(row: PayrollRow) {
    return {
      employeeId: row.employeeId,
      period: this.period(),
      baseSalary: row.base,
      bonuses: row.bonuses,
      deductions: row.deductions,
    };
  }

  private applyPayrollResult(employeeId: number, record: PayrollRecord) {
    this.updateRow(employeeId, (row) => {
      const base = record.baseSalary ?? row.base;
      const bonuses = record.bonuses ?? row.bonuses;
      const deductions = record.deductions ?? row.deductions;
      return {
        ...row,
        base,
        bonuses,
        deductions,
        net: record.netSalary ?? this.calcNet(base, bonuses, deductions),
        paid: true,
        selected: false,
      };
    });
  }

  private applyImport(text: string) {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length);
    if (!lines.length) {
      return { updated: 0, skipped: 0 };
    }
    const headerCells = this.parseCsvLine(lines.shift()!);
    const headers = headerCells.map((cell) => cell.replace(/\s+/g, '').toLowerCase());
    const idIdx = this.findHeader(headers, 'employeeid', 'id');
    const nameIdx = this.findHeader(headers, 'name', 'employee');
    const baseIdx = this.findHeader(headers, 'base', 'basesalary');
    const bonusIdx = this.findHeader(headers, 'bonus', 'bonuses');
    const deductionIdx = this.findHeader(headers, 'deduction', 'deductions');
    let updated = 0;
    let skipped = 0;
    const snapshot = this.rows();

    for (const line of lines) {
      const cells = this.parseCsvLine(line);
      const getCell = (idx: number) => (idx >= 0 ? cells[idx] ?? '' : '');
      const idValue = idIdx >= 0 ? Number(getCell(idIdx)) : NaN;
      let employeeId = Number.isFinite(idValue) ? Number(idValue) : undefined;

      if (!employeeId && nameIdx >= 0) {
        const name = getCell(nameIdx).toLowerCase();
        const match = snapshot.find((row) => (row.name || '').toLowerCase() === name);
        if (match) {
          employeeId = match.employeeId;
        }
      }

      if (!employeeId) {
        skipped++;
        continue;
      }

      const base = baseIdx >= 0 ? Number(getCell(baseIdx)) : undefined;
      const bonus = bonusIdx >= 0 ? Number(getCell(bonusIdx)) : undefined;
      const deduction = deductionIdx >= 0 ? Number(getCell(deductionIdx)) : undefined;

      if (
        [base, bonus, deduction].every(
          (value) => value === undefined || Number.isNaN(value)
        )
      ) {
        skipped++;
        continue;
      }

      this.updateRow(employeeId, (row) => {
        const updatedRow: PayrollRow = { ...row };
        if (base !== undefined && !Number.isNaN(base)) updatedRow.base = base;
        if (bonus !== undefined && !Number.isNaN(bonus)) updatedRow.bonuses = bonus;
        if (deduction !== undefined && !Number.isNaN(deduction)) {
          updatedRow.deductions = deduction;
        }
        updatedRow.net = this.calcNet(updatedRow.base, updatedRow.bonuses, updatedRow.deductions);
        updatedRow.selected = !updatedRow.paid;
        updatedRow.paid = false;
        return updatedRow;
      });
      updated++;
    }

    return { updated, skipped };
  }

  private parseCsvLine(line: string) {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  }

  private findHeader(headers: string[], ...keys: string[]) {
    for (const key of keys) {
      const idx = headers.findIndex((header) => header === key);
      if (idx >= 0) {
        return idx;
      }
    }
    return -1;
  }

  private toCsv(value: unknown) {
    const str = value === null || value === undefined ? '' : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
