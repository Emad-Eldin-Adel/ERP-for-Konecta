import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HrLeave, HrLeaveService } from '../../../core/services/hr-leave.service';

@Component({
  selector: 'app-hr-leave',
  standalone: true,
  templateUrl: './leave.component.html',
  imports: [CommonModule],
})
export class HrLeaveComponent {
  private service = inject(HrLeaveService);

  leaves = signal<HrLeave[]>([]);
  loading = signal(false);
  error = signal('');
  filter = signal<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  readonly statuses: Array<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'> = [
    'ALL',
    'PENDING',
    'APPROVED',
    'REJECTED',
  ];

  constructor() {
    this.refresh();
  }

  get filteredLeaves() {
    const status = this.filter();
    if (status === 'ALL') return this.leaves();
    return this.leaves().filter((l) => l.status === status);
  }

  refresh() {
    this.loading.set(true);
    this.service.listAll().subscribe({
      next: (res) => {
        this.leaves.set(res);
        this.error.set('');
      },
      error: (err) => (this.error.set(err?.error?.message || 'Failed to load leave requests')),
      complete: () => this.loading.set(false),
    });
  }

  approve(leave: HrLeave) {
    this.service.approve(leave.id).subscribe({
      next: (updated) => this.leaves.update((list) => list.map((item) => (item.id === updated.id ? updated : item))),
      error: (err) => this.error.set(err?.error?.message || 'Failed to approve request'),
    });
  }

  reject(leave: HrLeave) {
    this.service.reject(leave.id).subscribe({
      next: (updated) => this.leaves.update((list) => list.map((item) => (item.id === updated.id ? updated : item))),
      error: (err) => this.error.set(err?.error?.message || 'Failed to reject request'),
    });
  }
}
