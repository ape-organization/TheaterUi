import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly excludedPaths = [
    '/api/v1/auth/request-otp',
    '/api/v1/auth/verify-otp'
  ];

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isExcluded = this.excludedPaths.some((path) => req.url.includes(path));

    if (isExcluded) {
      return next.handle(req);
    }

    const token = localStorage.getItem('token');
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          // Token expired or invalid — log the user out and redirect to login
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(req);
  }
}
