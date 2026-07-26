import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { supervisorGuard } from './core/guards/supervisor.guard';

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
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent)
      },
      {
        path: 'transfers',
        loadComponent: () => import('./features/admin/transfers/transfers.component').then((m) => m.TransfersComponent)
      }
    ]
  },
  {
    path: 'supervisor',
    canActivate: [supervisorGuard],
    loadComponent: () => import('./features/supervisor/supervisor.component').then((m) => m.SupervisorComponent)
  },
  {
    path: '',
    redirectTo: '/event',
    pathMatch: 'full'
  }
];