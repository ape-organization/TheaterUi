import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
//&& authService.currentUser()?.role === 'admin'
  if (authService.isLoggedIn() && 
  authService.currentUser()?.user.role === 'ADMIN'
   ) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};