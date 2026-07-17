import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { AuthResponse, LoginRequest, OtpVerifyRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<AuthResponse | null>(null);
  readonly isAuthenticated = signal(false);
  readonly isLoading = signal(false);

  constructor(private readonly http: HttpClient) {}

  login(contactMethod: 'email' | 'phone', contactValue: string): Observable<AuthResponse> {
    this.isLoading.set(true);
    const payload: LoginRequest = { contactMethod };
    if (contactMethod === 'email') {
      payload.email = contactValue;
    } else {
      payload.phoneNumber = contactValue;
    }

    return this.http.post<AuthResponse>('/api/auth/login', payload).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  verifyOtp(contactMethod: 'email' | 'phone', contactValue: string, otp: string): Observable<AuthResponse> {
    this.isLoading.set(true);
    const payload: OtpVerifyRequest = { contactMethod, otp };
    if (contactMethod === 'email') {
      payload.email = contactValue;
    } else {
      payload.phoneNumber = contactValue;
    }

    return this.http.post<AuthResponse>('/api/auth/verify-otp', payload).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  setAuthenticatedUser(user: AuthResponse): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }
}
