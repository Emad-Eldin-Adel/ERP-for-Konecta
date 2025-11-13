import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  InviteUserDto,
  UserManagementService,
  UserResponse,
  UserSummary,
  UserRole,
  UserStatus,
} from '../../core/services/user-management.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule, DatePipe, FormsModule],
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserManagementService);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  users: UserResponse[] = [];
  summary: UserSummary | null = null;
  loadingUsers = signal(false);
  loadingSummary = signal(false);
  inviteSubmitting = signal(false);
  inviteMessage = signal('');
  inviteError = signal('');
  userError = signal('');

  readonly roles: UserRole[] = ['ADMIN', 'HR', 'FINANCE', 'EMPLOYEE'];
  readonly statuses: UserStatus[] = ['ACTIVE', 'INACTIVE'];
  currentUserRole: UserRole | null = null;

  inviteForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    role: ['HR' as UserRole, Validators.required],
    password: [''],
  });

  ngOnInit() {
    this.currentUserRole = (this.auth.currentUser?.role as UserRole) ?? null;
    this.auth.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => (this.currentUserRole = (user?.role as UserRole) ?? null));
    this.refreshData();
  }

  refreshData() {
    this.loadUsers();
    this.loadSummary();
  }

  private loadUsers() {
    this.loadingUsers.set(true);
    this.userService.listUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.userError.set('');
      },
      error: (err) => {
        this.userError.set(err?.error?.message || 'Failed to load users');
      },
      complete: () => this.loadingUsers.set(false),
    });
  }

  private loadSummary() {
    this.loadingSummary.set(true);
    this.userService.summary().subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: () => {
        // keep previous summary if available
      },
      complete: () => this.loadingSummary.set(false),
    });
  }

  submitInvite() {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    this.inviteSubmitting.set(true);
    this.inviteMessage.set('');
    this.inviteError.set('');
    const dto = this.inviteForm.value as InviteUserDto;
    this.userService.inviteUser(dto).subscribe({
      next: (res) => {
        this.inviteMessage.set(`Invite sent. Temporary password: ${res.temporaryPassword}`);
        this.inviteForm.reset({ role: 'HR' });
        this.refreshData();
      },
      error: (err) => {
        this.inviteError.set(err?.error?.message || 'Failed to invite user');
      },
      complete: () => this.inviteSubmitting.set(false),
    });
  }

  updateRole(user: UserResponse, role: UserRole) {
    if (user.role === role) {
      return;
    }
    this.userService.updateUser(user.id, { role }).subscribe({
      next: (updated) => {
        this.replaceUser(updated);
        this.loadSummary();
      },
      error: (err) => {
        this.userError.set(err?.error?.message || 'Failed to update role');
      },
    });
  }

  toggleStatus(user: UserResponse) {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.userService.updateUser(user.id, { status: nextStatus }).subscribe({
      next: (updated) => {
        this.replaceUser(updated);
        this.loadSummary();
      },
      error: (err) => {
        this.userError.set(err?.error?.message || 'Failed to update status');
      },
    });
  }

  private replaceUser(updated: UserResponse) {
    this.users = this.users.map((u) => (u.id === updated.id ? updated : u));
  }

  trackByUserId(_: number, item: UserResponse) {
    return item.id;
  }

  get canManageRoles() {
    return this.currentUserRole === 'ADMIN';
  }

  get canManageStatus() {
    return this.currentUserRole === 'ADMIN' || this.currentUserRole === 'HR';
  }
}
