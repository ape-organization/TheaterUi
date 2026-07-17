import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
      },
      {
        path: 'verify',
        loadComponent: () => import('./features/auth/verify-otp/verify-otp.component').then((m) => m.VerifyOtpComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
 
  {
    path: 'event',
    canActivate: [authGuard],
    loadComponent: () => import('./features/event/event.component').then((m) => m.EventComponent)
  },
  {
    path: 'booking-success',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking-success/booking-success.component').then((m) => m.BookingSuccessComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent)
  },
  {
    path: '',
    redirectTo: '/event',
    pathMatch: 'full'
  }
];