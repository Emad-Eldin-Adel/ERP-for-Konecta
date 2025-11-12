import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HrTraining,
  HrTrainingEnrollment,
  HrTrainingRequest,
  HrTrainingService,
} from '../../../core/services/hr-training.service';

@Component({
  selector: 'app-hr-training',
  standalone: true,
  templateUrl: './training.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class HrTrainingComponent {
  private service = inject(HrTrainingService);
  private fb = inject(FormBuilder);

  programs = signal<HrTraining[]>([]);
  enrollments = signal<HrTrainingEnrollment[]>([]);
  selectedProgram = signal<HrTraining | null>(null);
  error = signal('');
  submitting = signal(false);
  enrollmentsLoading = signal(false);

  form = this.fb.group({
    title: this.fb.nonNullable.control('', Validators.required),
    description: this.fb.control<string>(''),
    startDate: this.fb.control<string | null>(null),
    endDate: this.fb.control<string | null>(null),
    instructor: this.fb.control<string>(''),
    location: this.fb.control<string>(''),
  });

  constructor() {
    this.refresh();
  }

  refresh() {
    this.service.listPrograms().subscribe({
      next: (programs) => {
        this.programs.set(programs);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to load training programs'),
    });
  }

  startCreate() {
    this.form.reset();
    this.selectedProgram.set(null);
  }

  startEdit(program: HrTraining) {
    this.selectedProgram.set(program);
    this.form.patchValue({
      title: program.title,
      description: program.description,
      startDate: program.startDate,
      endDate: program.endDate,
      instructor: program.instructor,
      location: program.location,
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const payload = this.form.getRawValue() as HrTrainingRequest;
    const editing = this.selectedProgram();
    const req$ = editing
      ? this.service.updateProgram(editing.id, payload)
      : this.service.createProgram(payload);
    req$.subscribe({
      next: () => {
        this.refresh();
        this.selectedProgram.set(null);
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to save program'),
      complete: () => this.submitting.set(false),
    });
  }

  delete(program: HrTraining) {
    if (!confirm(`Delete ${program.title}?`)) return;
    this.service.deleteProgram(program.id).subscribe({
      next: () => this.refresh(),
      error: (err) => this.error.set(err?.error?.message || 'Failed to delete program'),
    });
  }

  loadEnrollments(program: HrTraining) {
    this.enrollmentsLoading.set(true);
    this.service.listEnrollments(program.id).subscribe({
      next: (rows) => {
        this.enrollments.set(rows);
        this.selectedProgram.set(program);
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to load enrollments'),
      complete: () => this.enrollmentsLoading.set(false),
    });
  }
}
