import { Component, EventEmitter, Input, OnInit, Output, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, AuthUser } from '../../services/auth.service';

type UserRole = AuthUser['role'];
type NavChild = { label: string; icon: string; path?: string; roles?: UserRole[] };
type NavItem = { label: string; icon: string; path?: string; roles?: UserRole[]; children?: NavChild[] };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  imports: [CommonModule, RouterLink, RouterLinkActive],
})
export class SidebarComponent implements OnInit {
  /** compact vs expanded width */
  private _isOpen = true;

  @Input()
  set isOpen(value: boolean) {
    this._isOpen = value ?? true;
  }
  get isOpen(): boolean {
    return this._isOpen;
  }

  @Output() isOpenChange = new EventEmitter<boolean>();

  /** top dashboard link */
  dashPath = '/';

  /** menu model (replace with your real routes) */
  computedItems: NavItem[] = [
    {
      label: 'My Workspace',
      icon: 'work',
      roles: ['EMPLOYEE'],
      path: '/workspace'
    },
    {
      label: 'HR',
      icon: 'badge',
      roles: ['ADMIN', 'HR'],
      children: [
        { label: 'Employees', icon: 'group', path: '/hr/employees' },
        { label: 'Departments', icon: 'corporate_fare', path: '/hr/departments' },
        { label: 'Jobs', icon: 'work', path: '/hr/jobs' },
        { label: 'Attendance', icon: 'event_available', path: '/hr/attendance' },
        { label: 'Leave', icon: 'beach_access', path: '/hr/leave' },
        { label: 'Performance', icon: 'insights', path: '/hr/performance' },
        { label: 'Training', icon: 'school', path: '/hr/training' },
        { label: 'Offboarding', icon: 'logout', path: '/hr/offboarding' },
      ],
    },
    {
      label: 'Finance',
      icon: 'account_balance',
      roles: ['ADMIN', 'FINANCE'],
      children: [
        { label: 'Overview', icon: 'monitoring', path: '/finance/overview' },
        { label: 'Budgeting', icon: 'account_tree', path: '/finance/budgeting' },
        { label: 'Expenses', icon: 'receipt', path: '/finance/expenses' },
        { label: 'Invoices', icon: 'receipt_long', path: '/finance/invoices' },
        { label: 'Payroll', icon: 'payments', path: '/finance/payroll' },
      ],
    },
    {
      label: 'Admin',
      icon: 'admin_panel_settings',
      roles: ['ADMIN'],
      children: [
        { label: 'Users', icon: 'groups', path: '/admin/users' },
        { label: 'Roles', icon: 'workspace_premium', path: '/admin/roles' },
        { label: 'Settings', icon: 'tune', path: '/admin/settings' },
      ],
    },
  ];

  role: UserRole | null = null;
  visibleItems: NavItem[] = [];

  /** expanded group state */
  private expanded = new Set<number>();
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.role = user?.role ?? null;
        this.updateVisibleItems();
      });

    this.role = this.auth.currentUser?.role ?? null;
    this.updateVisibleItems();
  }

  toggleGroup(i: number) {
    this.expanded.has(i) ? this.expanded.delete(i) : this.expanded.add(i);
  }

  isExpanded(i: number) {
    return this.expanded.has(i);
  }

  /** map to Material Symbols (or just return the string) */
  materialIcon(name: string) {
    return name || 'chevron_right';
  }

  toggleSidebar() {
    const next = !this._isOpen;
    this._isOpen = next;
    this.isOpenChange.emit(next);
  }

  primaryPath(item: NavItem): string {
    if (item.path) return item.path;
    const firstChild = item.children?.find((child) => !!child.path);
    return firstChild?.path ?? this.dashPath;
  }

  private updateVisibleItems() {
    this.visibleItems = this.computedItems
      .map((item) => this.filterForRole(item))
      .filter((item): item is NavItem => !!item);

    this.expanded.clear();
    this.visibleItems.forEach((item, index) => {
      if (item.children?.length) {
        this.expanded.add(index);
      }
    });
  }

  private filterForRole(item: NavItem): NavItem | null {
    if (!this.isRoleAllowed(item.roles)) {
      return null;
    }

    const filteredChildren = item.children
      ?.map((child) => (this.isRoleAllowed(child.roles) ? child : null))
      .filter((child): child is NavChild => !!child);

    if (item.children && (!filteredChildren || filteredChildren.length === 0) && !item.path) {
      return null;
    }

    return { ...item, children: filteredChildren ?? undefined };
  }

  private isRoleAllowed(roles?: UserRole[]): boolean {
    if (!roles || roles.length === 0) {
      return !!this.role;
    }
    return this.role ? roles.includes(this.role) : false;
  }
}
