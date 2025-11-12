import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HrJob, HrJobRequest, HrJobService, JobStatus } from '../../../core/services/hr-job.service';
import { HrDepartmentService, HrDepartment } from '../../../core/services/hr-department.service';

@Component({
  selector: 'app-hr-jobs',
  standalone: true,
  templateUrl: './jobs.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class HrJobsComponent implements OnInit {
  private jobService = inject(HrJobService);
  private departmentService = inject(HrDepartmentService);
  private fb = inject(FormBuilder);

  jobs = signal<HrJob[]>([]);
  departments = signal<HrDepartment[]>([]);
  modalOpen = signal(false);
  editing = signal<HrJob | null>(null);
  submitting = signal(false);
  error = signal('');
  formError = signal('');

  readonly statuses: (JobStatus | 'ON_HOLD')[] = ['OPEN', 'ON_HOLD', 'CLOSED'];

  form = this.fb.group({
    title: this.fb.nonNullable.control('', Validators.required),
    description: this.fb.control<string>(''),
    departmentId: this.fb.control<number | null>(null),
    location: this.fb.control<string>(''),
    employmentType: this.fb.control<string>('Full-time'),
    status: this.fb.control<string | null>('OPEN'),
  });

  ngOnInit() {
    this.loadJobs();
    this.departmentService.list().subscribe((depts) => this.departments.set(depts));
  }

  loadJobs() {
    this.jobService.list().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.error.set('');
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to load jobs'),
    });
  }

  startCreate() {
    this.form.reset({ employmentType: 'Full-time', status: 'OPEN' });
    this.editing.set(null);
    this.formError.set('');
    this.modalOpen.set(true);
  }

  startEdit(job: HrJob) {
    this.editing.set(job);
    this.form.patchValue({
      title: job.title,
      description: job.description,
      departmentId: job.departmentId,
      location: job.location,
      employmentType: job.employmentType,
      status: job.status,
    });
    this.modalOpen.set(true);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const payload = this.form.getRawValue() as HrJobRequest;
    const editing = this.editing();
    const req$ = editing ? this.jobService.update(editing.id, payload) : this.jobService.create(payload);
    req$.subscribe({
      next: (job) => {
        if (editing) {
          this.jobs.update((list) => list.map((j) => (j.id === job.id ? job : j)));
        } else {
          this.jobs.update((list) => [job, ...list]);
        }
        this.modalOpen.set(false);
      },
      error: (err) => this.formError.set(err?.error?.message || 'Failed to save job'),
      complete: () => this.submitting.set(false),
    });
  }

  delete(job: HrJob) {
    if (!confirm(`Delete ${job.title}?`)) return;
    this.jobService.delete(job.id).subscribe({
      next: () => this.jobs.update((items) => items.filter((j) => j.id !== job.id)),
      error: (err) => this.error.set(err?.error?.message || 'Failed to delete job'),
    });
  }
}
