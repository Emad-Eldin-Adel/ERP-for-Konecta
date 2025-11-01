// src/app/core/layout/nav/nav.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // NgIf, NgFor, NgClass
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './nav.component.html',
  imports: [CommonModule, RouterLink], // ✅ needed for your template
})
export class NavbarComponent {
  // Minimal properties so bindings stop erroring
  brandOn = false;
  readonly launcherDots = Array.from({ length: 3 });
  role: 'EMPLOYEE' | 'ADMIN' | 'HR' | 'FINANCE' | null = null;
  isHomeRoute = true;
  isAuthRoute = false;
  isProfileMenuOpen = false;

  initials = 'AA';
  email = 'user@example.com';

  @Output() toggle = new EventEmitter<void>();
  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }
  onSignOutClick() {}
}
