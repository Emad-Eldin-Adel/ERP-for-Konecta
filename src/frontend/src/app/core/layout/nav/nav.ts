// src/app/core/layout/nav/nav.ts
import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './nav.component.html',
  imports: [CommonModule, RouterLink],
})
export class NavbarComponent {
  brandOn = false;
  role: AuthUser['role'] | null = null;

  isHomeRoute = false;
  isAuthRoute = false;
  isProfileMenuOpen = false;

  initials = 'AA';
  email = '';

  private router = inject(Router);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // set initial flags
    this.setFlags(this.router.url);
    // update on navigation
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.setFlags(e.urlAfterRedirects));

    this.auth.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => this.applyUser(user));
  }

  private setFlags(url: string) {
    this.isHomeRoute = url === '/' || url === '';
    this.isAuthRoute = url.startsWith('/auth/');
  }

  private applyUser(user: AuthUser | null) {
    this.role = user?.role ?? null;
    this.email = user?.email ?? '';
    this.initials = this.createInitials(user?.fullName || user?.email || '');
    this.brandOn = !!user;
  }

  private createInitials(value: string) {
    if (!value) {
      return 'AA';
    }
    const parts = value.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }
  onSignOutClick() {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
    this.isProfileMenuOpen = false;
  }
}
