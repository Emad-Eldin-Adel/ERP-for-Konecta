import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser;
  if (user && user.role === 'ADMIN') {
    return true;
  }

  router.navigateByUrl('/auth/login');
  return false;
};
