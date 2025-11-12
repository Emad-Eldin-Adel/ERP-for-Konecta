import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HrEmployee, HrEmployeeRequest, HrEmployeeService } from '../../../core/services/hr-employee.service';

@Component({
  selector: 'app-hr-employees',
  standalone: true,
  templateUrl: './employee-dashboard.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class HrEmployeeDashboardComponent implements OnInit {
  private service = inject(HrEmployeeService);
  private fb = inject(FormBuilder);

  employees = signal<HrEmployee[]>([]);
  loading = signal(false);
  submitting = signal(false);
  showForm = signal(false);
  formTitle = signal('Add employee');
  search = signal('');
  error = signal('');
  formError = signal('');
  selectedEmployee = signal<HrEmployee | null>(null);

  form = this.fb.group({
    firstName: this.fb.nonNullable.control('', Validators.required),
    lastName: this.fb.nonNullable.control('', Validators.required),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    phone: this.fb.control<string>(''),
    position: this.fb.nonNullable.control('', Validators.required),
    hireDate: this.fb.control<string | null>(null),
    salary: this.fb.control<number | null>(null),
    workingHours: this.fb.control<number | null>(null),
    departmentId: this.fb.control<number | null>(null),
  });

  stats = computed(() => {
    const list = this.employees();
    if (!list.length) {
      return { total: 0, departments: 0, avgSalary: 0, newestHire: null as string | null };
    }
    const depts = new Set(list.map((e) => e.departmentName).filter(Boolean));
    const salaries = list.map((e) => e.salary || 0).filter((v) => v > 0);
    const avgSalary = salaries.length ? Math.round((salaries.reduce((a, b) => a + b, 0) / salaries.length) * 100) / 100 : 0;
    const newest = [...list]
      .filter((e) => e.hireDate)
      .sort((a, b) => (a.hireDate! < b.hireDate! ? 1 : -1))[0]?.hireDate || null;
    return { total: list.length, departments: depts.size, avgSalary, newestHire: newest };
  });

  filteredEmployees = computed(() => {
    const query = this.search().toLowerCase().trim();
    if (!query) {
      return this.employees();
    }
    return this.employees().filter((emp) =>
      [
        emp.firstName,
        emp.lastName,
        emp.email,
        emp.position,
        emp.departmentName,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  });

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (res) => {
        this.employees.set(res);
        this.error.set('');
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load employees');
      },
      complete: () => this.loading.set(false),
    });
  }

  startCreate() {
    this.form.reset();
    this.form.enable();
    this.formTitle.set('Add employee');
    this.selectedEmployee.set(null);
    this.formError.set('');
    this.showForm.set(true);
  }

  startEdit(employee: HrEmployee) {
    this.selectedEmployee.set(employee);
    this.form.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      hireDate: employee.hireDate,
      salary: employee.salary ?? null,
      workingHours: employee.workingHours ?? null,
      departmentId: employee.departmentId ?? null,
    });
    this.formTitle.set(`Edit ${employee.firstName} ${employee.lastName}`);
    this.formError.set('');
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.form.reset();
    this.selectedEmployee.set(null);
  }

  submitForm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.formError.set('');
    const payload = this.toRequest(this.form.getRawValue());
    const selected = this.selectedEmployee();
    const request$ = selected ? this.service.update(selected.id, payload) : this.service.create(payload);

    request$.subscribe({
      next: (employee) => {
        if (selected) {
          this.employees.update((list) => list.map((item) => (item.id === employee.id ? employee : item)));
        } else {
          this.employees.update((list) => [employee, ...list]);
        }
        this.cancelForm();
      },
      error: (err) => {
        this.formError.set(err?.error?.message || 'Failed to save employee');
      },
      complete: () => this.submitting.set(false),
    });
  }

  deleteEmployee(employee: HrEmployee) {
    if (!confirm(`Remove ${employee.firstName} ${employee.lastName}?`)) {
      return;
    }
    this.service.delete(employee.id).subscribe({
      next: () => {
        this.employees.update((list) => list.filter((item) => item.id !== employee.id));
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to delete employee');
      },
    });
  }

  trackById = (_: number, employee: HrEmployee) => employee.id;

  private toRequest(value: any): HrEmployeeRequest {
    return {
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      email: value.email ?? '',
      phone: value.phone ?? '',
      position: value.position ?? '',
      hireDate: value.hireDate ? value.hireDate : null,
      salary: value.salary !== undefined && value.salary !== null ? Number(value.salary) : null,
      workingHours: value.workingHours !== undefined && value.workingHours !== null ? Number(value.workingHours) : null,
      departmentId:
        value.departmentId !== undefined && value.departmentId !== null ? Number(value.departmentId) : null,
    };
  }
}
