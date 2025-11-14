import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HrAttendance, HrAttendanceService } from '../../../core/services/hr-attendance.service';

@Component({
  selector: 'app-hr-attendance',
  standalone: true,
  templateUrl: './attendance.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class HrAttendanceComponent implements OnInit {
  private service = inject(HrAttendanceService);
  private fb = inject(FormBuilder);

  records = signal<HrAttendance[]>([]);
  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    query: this.fb.control(''),
  });

  ngOnInit(): void {
    this.loadRecords();
  }

  fetch() {
    const raw = (this.form.value.query ?? '').toString().trim();
    if (!raw) {
      this.loadRecords();
      return;
    }
    this.loading.set(true);
    this.service.list(raw).subscribe({
      next: (attendance) => {
        this.records.set(attendance);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to load attendance'),
      complete: () => this.loading.set(false),
    });
  }

  reset() {
    this.form.reset();
    this.loadRecords();
  }

  private loadRecords(search?: string) {
    this.loading.set(true);
    this.service.list(search).subscribe({
      next: (attendance) => {
        this.records.set(attendance);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Unable to load attendance'),
      complete: () => this.loading.set(false),
    });
  }
}
