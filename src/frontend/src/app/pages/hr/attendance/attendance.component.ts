import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HrAttendance, HrAttendanceService } from '../../../core/services/hr-attendance.service';

@Component({
  selector: 'app-hr-attendance',
  standalone: true,
  templateUrl: './attendance.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class HrAttendanceComponent {
  private service = inject(HrAttendanceService);
  private fb = inject(FormBuilder);

  records = signal<HrAttendance[]>([]);
  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    employeeId: this.fb.nonNullable.control<number | null>(null, Validators.required),
  });

  fetch() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const employeeId = Number(this.form.value.employeeId);
    this.loading.set(true);
    this.service.byEmployee(employeeId).subscribe({
      next: (attendance) => {
        this.records.set(attendance);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to load attendance'),
      complete: () => this.loading.set(false),
    });
  }
}
