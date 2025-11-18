import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HrAttendance, HrAttendanceService } from '../../../core/services/hr-attendance.service';
import { HrLeave, HrLeaveService } from '../../../core/services/hr-leave.service';
import { HrPerformance, HrPerformanceService } from '../../../core/services/hr-performance.service';

@Component({
  selector: 'app-employee-self-service',
  standalone: true,
  templateUrl: './employee-self-service.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class EmployeeSelfServiceComponent implements OnInit {
  private attendanceService = inject(HrAttendanceService);
  private leaveService = inject(HrLeaveService);
  private performanceService = inject(HrPerformanceService);
  private fb = inject(FormBuilder);

  readonly timeOffTypes = [
    { value: 'VACATION', label: 'Vacation' },
    { value: 'HOLIDAY', label: 'Holiday' },
    { value: 'PERSONAL', label: 'Personal day' },
    { value: 'SICK', label: 'Sick time' },
    { value: 'UNPAID', label: 'Unpaid leave' },
    { value: 'OTHER', label: 'Other' },
  ];

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

  performance = signal<HrPerformance[]>([]);
  performanceLoading = signal(false);
  performanceError = signal('');

  leaveForm = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    leaveType: ['VACATION', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    this.refreshAttendance();
    this.refreshLeaves();
    this.refreshPerformance();
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

  refreshPerformance() {
    this.performanceLoading.set(true);
    this.performanceService.mine().subscribe({
      next: (records) => {
        const sorted = [...records].sort((a, b) =>
          (b.reviewDate || '').localeCompare(a.reviewDate || '')
        );
        this.performance.set(sorted);
        this.performanceError.set('');
      },
      error: (err) => this.performanceError.set(err?.error?.message || 'Unable to load performance reviews'),
      complete: () => this.performanceLoading.set(false),
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

  get leaveTypeControl() {
    return this.leaveForm.get('leaveType');
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
    const payload = this.leaveForm.value as {
      startDate: string;
      endDate: string;
      reason: string;
      leaveType: string;
    };
    this.leaveService.request(payload).subscribe({
      next: () => {
        this.leaveMessage.set('Leave request submitted.');
        this.leaveForm.reset({ leaveType: 'VACATION' });
        this.refreshLeaves();
      },
      error: (err) => this.leaveError.set(err?.error?.message || 'Failed to submit leave request'),
      complete: () => this.leaveSubmitting.set(false),
    });
  }

  leaveTypeLabel(type: string | null | undefined) {
    if (!type) {
      return 'Unspecified';
    }
    const option = this.timeOffTypes.find((opt) => opt.value === type);
    if (option) {
      return option.label;
    }
    const lower = type.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
}
