import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const rolesGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed: string[] = route.data?.['roles'] ?? [];
  const user = auth.currentUser;

  if (user && (allowed.length === 0 || allowed.includes(user.role))) {
    return true;
  }

  router.navigateByUrl('/auth/login');
  return false;
};
