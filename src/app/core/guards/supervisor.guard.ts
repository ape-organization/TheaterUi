import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const supervisorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
//&& authService.currentUser()?.role === 'supervisor'
  if (authService.isAuthenticated() && authService.currentUser()?.role === 'supervisor') {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};