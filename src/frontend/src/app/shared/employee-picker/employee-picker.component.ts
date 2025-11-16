import { CommonModule } from '@angular/common';
import { Component, Input, computed, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HrEmployee, HrEmployeeService } from '../../core/services/hr-employee.service';

@Component({
  selector: 'app-employee-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-picker.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: EmployeePickerComponent,
    },
  ],
})
export class EmployeePickerComponent implements ControlValueAccessor {
  @Input() label = 'Employee';
  @Input() placeholder = 'Search by name, email, or ID';
  @Input() hint = 'Start typing to search the directory.';
  @Input() required = false;

  private employeeService = inject(HrEmployeeService);

  private pendingValue: number | null = null;
  private propagateChange: (value: number | null) => void = () => {};
  private propagateTouched: () => void = () => {};

  employees = signal<HrEmployee[]>([]);
  loading = signal(true);
  loadError = signal('');
  searchTerm = signal('');
  dropdownVisible = signal(false);
  selectedEmployee = signal<HrEmployee | null>(null);
  disabled = signal(false);

  suggestions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.employees();
    if (!term) {
      return list.slice(0, 6);
    }
    return list
      .filter((emp) => {
        const name = `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim().toLowerCase();
        const email = emp.email?.toLowerCase() ?? '';
        const id = `${emp.id}`;
        return (
          (name && name.includes(term)) ||
          (email && email.includes(term)) ||
          id.includes(term)
        );
      })
      .slice(0, 6);
  });

  constructor() {
    this.employeeService.list().subscribe({
      next: (rows) => {
        this.employees.set(rows);
        this.loading.set(false);
        this.loadError.set('');
        this.applyPendingValue();
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set('Unable to load employees');
      },
    });
  }

  writeValue(value: number | null): void {
    this.pendingValue = value ?? null;
    if (value === null) {
      this.selectedEmployee.set(null);
      this.searchTerm.set('');
    } else {
      this.applyPendingValue();
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.propagateTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(value: string) {
    if (this.disabled()) {
      return;
    }
    this.searchTerm.set(value);
    this.dropdownVisible.set(true);
    if (this.selectedEmployee() && value !== this.displayLabel(this.selectedEmployee()!)) {
      this.selectedEmployee.set(null);
      this.propagateChange(null);
    }
  }

  openDropdown() {
    if (!this.disabled()) {
      this.dropdownVisible.set(true);
    }
  }

  handleBlur() {
    setTimeout(() => this.dropdownVisible.set(false), 120);
    this.propagateTouched();
  }

  selectEmployee(emp: HrEmployee) {
    if (this.disabled()) {
      return;
    }
    this.selectedEmployee.set(emp);
    this.pendingValue = emp.id;
    this.searchTerm.set(this.displayLabel(emp));
    this.dropdownVisible.set(false);
    this.propagateChange(emp.id);
    this.propagateTouched();
  }

  clearSelection() {
    if (this.disabled()) {
      return;
    }
    this.selectedEmployee.set(null);
    this.searchTerm.set('');
    this.pendingValue = null;
    this.propagateChange(null);
    this.dropdownVisible.set(false);
  }

  employeeSummary(emp: HrEmployee | null) {
    if (!emp) return '';
    const name = this.displayLabel(emp);
    const email = emp.email ? ` · ${emp.email}` : '';
    return `${name}${email} · #${emp.id}`;
  }

  employeeName(emp: HrEmployee) {
    return this.displayLabel(emp);
  }

  private displayLabel(emp: HrEmployee) {
    const name = `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim();
    if (name) return name;
    if (emp.email) return emp.email;
    return `#${emp.id}`;
  }

  private applyPendingValue() {
    if (this.pendingValue === null) {
      return;
    }
    const match = this.employees().find((emp) => emp.id === this.pendingValue);
    if (match) {
      this.selectedEmployee.set(match);
      this.searchTerm.set(this.displayLabel(match));
      this.pendingValue = match.id;
    }
  }
}
