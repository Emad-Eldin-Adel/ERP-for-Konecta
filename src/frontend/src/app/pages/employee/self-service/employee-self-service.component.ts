import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HrAttendance, HrAttendanceService } from '../../../core/services/hr-attendance.service';
import { HrLeave, HrLeaveService } from '../../../core/services/hr-leave.service';

@Component({
  selector: 'app-employee-self-service',
  standalone: true,
  templateUrl: './employee-self-service.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class EmployeeSelfServiceComponent implements OnInit {
  private attendanceService = inject(HrAttendanceService);
  private leaveService = inject(HrLeaveService);
  private fb = inject(FormBuilder);

  attendance = signal<HrAttendance[]>([]);
  attendanceLoading = signal(false);
  attendanceError = signal('');
  checkInSubmitting = signal(false);
  checkOutSubmitting = signal(false);

  leaves = signal<HrLeave[]>([]);
  leaveLoading = signal(false);
  leaveError = signal('');
  leaveMessage = signal('');
  leaveSubmitting = signal(false);

  leaveForm = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    this.refreshAttendance();
    this.refreshLeaves();
  }

  refreshAttendance() {
    this.attendanceLoading.set(true);
    this.attendanceService.mine().subscribe({
      next: (records) => {
        this.attendance.set(records);
        this.attendanceError.set('');
      },
      error: (err) => this.attendanceError.set(err?.error?.message || 'Unable to load attendance'),
      complete: () => this.attendanceLoading.set(false),
    });
  }

  refreshLeaves() {
    this.leaveLoading.set(true);
    this.leaveService.mine().subscribe({
      next: (res) => {
        this.leaves.set(res);
        this.leaveError.set('');
      },
      error: (err) => this.leaveError.set(err?.error?.message || 'Unable to load leave requests'),
      complete: () => this.leaveLoading.set(false),
    });
  }

  get todayRecord() {
    const today = new Date().toISOString().slice(0, 10);
    return this.attendance().find((r) => r.date === today) ?? null;
  }

  get canCheckIn() {
    const record = this.todayRecord;
    return !this.checkInSubmitting() && (!record || !record.checkInAt);
  }

  get canCheckOut() {
    const record = this.todayRecord;
    return !this.checkOutSubmitting() && !!record?.checkInAt && !record.checkOutAt;
  }

  checkIn() {
    if (!this.canCheckIn) {
      return;
    }
    this.checkInSubmitting.set(true);
    this.attendanceService.checkIn().subscribe({
      next: () => this.refreshAttendance(),
      error: (err) => this.attendanceError.set(err?.error?.message || 'Failed to check in'),
      complete: () => this.checkInSubmitting.set(false),
    });
  }

  checkOut() {
    if (!this.canCheckOut) {
      return;
    }
    this.checkOutSubmitting.set(true);
    this.attendanceService.checkOut().subscribe({
      next: () => this.refreshAttendance(),
      error: (err) => this.attendanceError.set(err?.error?.message || 'Failed to check out'),
      complete: () => this.checkOutSubmitting.set(false),
    });
  }

  submitLeave() {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }
    this.leaveSubmitting.set(true);
    this.leaveMessage.set('');
    this.leaveError.set('');
    const payload = this.leaveForm.value as { startDate: string; endDate: string; reason: string };
    this.leaveService.request(payload).subscribe({
      next: () => {
        this.leaveMessage.set('Leave request submitted.');
        this.leaveForm.reset();
        this.refreshLeaves();
      },
      error: (err) => this.leaveError.set(err?.error?.message || 'Failed to submit leave request'),
      complete: () => this.leaveSubmitting.set(false),
    });
  }
}
