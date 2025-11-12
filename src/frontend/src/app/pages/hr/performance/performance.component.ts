import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HrPerformance,
  HrPerformanceRequest,
  HrPerformanceService,
} from '../../../core/services/hr-performance.service';

@Component({
  selector: 'app-hr-performance',
  standalone: true,
  templateUrl: './performance.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class HrPerformanceComponent {
  private service = inject(HrPerformanceService);
  private fb = inject(FormBuilder);

  entries = signal<HrPerformance[]>([]);
  error = signal('');
  submitting = signal(false);

  form = this.fb.group({
    employeeId: this.fb.nonNullable.control<number | null>(null, Validators.required),
    rating: this.fb.nonNullable.control<number | null>(null, Validators.required),
    feedback: this.fb.control<string>(''),
    reviewDate: this.fb.nonNullable.control<string | null>(null, Validators.required),
  });

  fetch() {
    if (!this.form.value.employeeId) {
      this.form.get('employeeId')?.markAsTouched();
      return;
    }
    const id = Number(this.form.value.employeeId);
    this.service.byEmployee(id).subscribe({
      next: (list) => {
        this.entries.set(list);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to load performance records'),
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const payload = this.form.getRawValue() as HrPerformanceRequest;
    this.service.create(payload).subscribe({
      next: (entry) => {
        this.entries.update((list) => [entry, ...list]);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to record review'),
      complete: () => this.submitting.set(false),
    });
  }
}
