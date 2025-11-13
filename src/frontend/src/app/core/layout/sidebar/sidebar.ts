import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

type NavChild = { label: string; icon: string; path?: string };
type NavItem = { label: string; icon: string; path?: string; children?: NavChild[] };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  imports: [CommonModule, RouterLink, RouterLinkActive],
})
export class SidebarComponent {
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
      label: 'HR',
      icon: 'badge',
      children: [
        { label: 'Users', icon: 'group', path: '/hr/users' },
        { label: 'Attendance', icon: 'event_available', path: '/hr/attendance' },
        { label: 'Leaves', icon: 'beach_access', path: '/hr/leaves' },
      ],
    },
    {
      label: 'Finance',
      icon: 'account_balance',
      children: [
        { label: 'Overview', icon: 'monitoring', path: '/finance/overview' },
        { label: 'Expenses', icon: 'receipt', path: '/finance/expenses' },
        { label: 'Invoices', icon: 'receipt_long', path: '/finance/invoices' },
        { label: 'Payroll', icon: 'payments', path: '/finance/payroll' },
      ],
    },
    {
      label: 'Admin',
      icon: 'admin_panel_settings',
      children: [
        { label: 'Users', icon: 'groups', path: '/admin/users' },
        { label: 'Roles', icon: 'workspace_premium', path: '/admin/roles' },
        { label: 'Settings', icon: 'tune', path: '/admin/settings' },
      ],
    },
  ];

  /** expanded group state */
  private expanded = new Set<number>();
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
}
