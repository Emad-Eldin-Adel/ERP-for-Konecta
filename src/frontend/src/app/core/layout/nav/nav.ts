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
  isHrRoute = false;
  isFinanceRoute = false;
  isProfileMenuOpen = false;

  initials = 'AA';
  email = '';

  private router = inject(Router);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // set initial flags
    this.setFlags(this.router.url);
    this.applyUser(this.auth.currentUser);
    // update on navigation
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.setFlags(e.urlAfterRedirects));

    this.auth.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => this.applyUser(user));
  }

  private setFlags(url: string) {
    const normalized = this.normalizeUrl(url);
    this.isHomeRoute = normalized === '/' || normalized === '';
    this.isAuthRoute = normalized.startsWith('/auth/');
    this.isHrRoute = normalized.startsWith('/hr');
    this.isFinanceRoute = normalized.startsWith('/finance');
  }

  private applyUser(user: AuthUser | null) {
    this.role = user?.role ?? null;
    this.email = user?.email ?? '';
    this.initials = this.createInitials(user?.fullName || user?.email || '');
    this.brandOn = !!user;
  }

  private normalizeUrl(url: string) {
    if (!url) {
      return '/';
    }
    const questionIndex = url.indexOf('?');
    const hashIndex = url.indexOf('#');
    let end = url.length;
    if (questionIndex !== -1) {
      end = Math.min(end, questionIndex);
    }
    if (hashIndex !== -1) {
      end = Math.min(end, hashIndex);
    }
    return url.slice(0, end) || '/';
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
