// src/app/core/layout/nav/nav.ts
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './nav.component.html',
  imports: [CommonModule, RouterLink, RouterLinkActive],
})
export class NavbarComponent {
  brandOn = false;
  readonly launcherDots = Array.from({ length: 3 });
  role: 'EMPLOYEE' | 'ADMIN' | 'HR' | 'FINANCE' | null = null;

  isHomeRoute = false;
  isAuthRoute = false;
  isProfileMenuOpen = false;

  initials = 'AA';
  email = 'user@example.com';

  @Output() toggle = new EventEmitter<void>();

  private router = inject(Router);

  constructor() {
    // set initial flags
    this.setFlags(this.router.url);
    // update on navigation
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.setFlags(e.urlAfterRedirects));
  }

  private setFlags(url: string) {
    this.isHomeRoute = url === '/' || url === '';
    this.isAuthRoute = url.startsWith('/auth/');
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }
  onSignOutClick() {}
}
