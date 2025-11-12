import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HrDepartment, HrDepartmentRequest, HrDepartmentService } from '../../../core/services/hr-department.service';

@Component({
  selector: 'app-hr-departments',
  standalone: true,
  templateUrl: './departments.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class HrDepartmentsComponent {
  private service = inject(HrDepartmentService);
  private fb = inject(FormBuilder);

  departments = signal<HrDepartment[]>([]);
  loading = signal(false);
  submitting = signal(false);
  error = signal('');
  formError = signal('');
  editing = signal<HrDepartment | null>(null);
  modalOpen = signal(false);

  form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    description: this.fb.control<string>(''),
  });

  constructor() {
    this.fetch();
  }

  fetch() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (res) => {
        this.departments.set(res);
        this.error.set('');
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to load departments');
      },
      complete: () => this.loading.set(false),
    });
  }

  startCreate() {
    this.form.reset();
    this.editing.set(null);
    this.formError.set('');
    this.modalOpen.set(true);
  }

  startEdit(dept: HrDepartment) {
    this.editing.set(dept);
    this.form.patchValue({ name: dept.name, description: dept.description });
    this.formError.set('');
    this.modalOpen.set(true);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const payload = this.form.value as HrDepartmentRequest;
    const editing = this.editing();
    const req$ = editing ? this.service.update(editing.id, payload) : this.service.create(payload);
    req$.subscribe({
      next: (dept) => {
        if (editing) {
          this.departments.update((items) => items.map((d) => (d.id === dept.id ? dept : d)));
        } else {
          this.departments.update((items) => [dept, ...items]);
        }
        this.modalOpen.set(false);
      },
      error: (err) => this.formError.set(err?.error?.message || 'Failed to save department'),
      complete: () => this.submitting.set(false),
    });
  }

  delete(dept: HrDepartment) {
    if (!confirm(`Delete ${dept.name}?`)) {
      return;
    }
    this.service.delete(dept.id).subscribe({
      next: () => this.departments.update((items) => items.filter((d) => d.id !== dept.id)),
      error: (err) => this.error.set(err?.error?.message || 'Failed to delete department'),
    });
  }
}
