import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HrOffboardingRequest,
  HrOffboardingService,
  HrOffboardingStatus,
} from '../../../core/services/hr-offboarding.service';
import { EmployeePickerComponent } from '../../../shared/employee-picker/employee-picker.component';

@Component({
  selector: 'app-hr-offboarding',
  standalone: true,
  templateUrl: './offboarding.component.html',
  imports: [CommonModule, ReactiveFormsModule, EmployeePickerComponent],
})
export class HrOffboardingComponent {
  private service = inject(HrOffboardingService);
  private fb = inject(FormBuilder);

  status = signal<HrOffboardingStatus | null>(null);
  error = signal('');

  form = this.fb.group({
    employeeId: this.fb.nonNullable.control<number | null>(null, Validators.required),
    lastWorkingDay: this.fb.control<string | null>(null),
    interviewAt: this.fb.control<string | null>(null),
  });

  loadStatus() {
    if (!this.form.value.employeeId) {
      this.form.get('employeeId')?.markAsTouched();
      return;
    }
    const id = Number(this.form.value.employeeId);
    this.service.status(id).subscribe({
      next: (status) => {
        this.status.set(status);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to fetch status'),
    });
  }

  trigger(action: 'initiate' | 'interview' | 'clearance' | 'exit') {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue() as HrOffboardingRequest;
    const request$ =
      action === 'initiate'
        ? this.service.initiate(payload)
        : action === 'interview'
          ? this.service.interview(payload)
          : action === 'clearance'
            ? this.service.clearance(payload)
            : this.service.exitDocuments(payload);
    request$.subscribe({
      next: (status) => {
        this.status.set(status);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Step failed'),
    });
  }
}
