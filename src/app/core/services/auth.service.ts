import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { AuthOtpVerifyRequest, AuthRequest, AuthResponse, LoginRequest, OtpVerifyRequest } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<AuthResponse | null>(null);
  readonly isAuthenticated = signal(false);
  readonly isLoading = signal(false);

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  constructor(private readonly http: HttpClient) {
    // Restore user from localStorage on refresh so guards that check
    // currentUser().user.role still work after a page reload.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user: AuthResponse = JSON.parse(storedUser);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch {
        localStorage.removeItem('user');
      }
    }
  }

  login(contactMethod: 'email' | 'phone', contactValue: string): Observable<AuthResponse> {
    this.isLoading.set(true);

    const payload: LoginRequest = { contactMethod };
    const body: AuthRequest = { phone: contactValue };

    if (contactMethod === 'email') {
      payload.email = contactValue;
    } else {
      body.phone = contactValue;
    }
    console.log(body);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/request-otp`, body).pipe(
      finalize(() => { this.isLoading.set(false) })
    );
  }

  verifyOtp(contactMethod: 'email' | 'phone', contactValue: string, otp: string): Observable<AuthResponse> {
    this.isLoading.set(true);

    const payload: OtpVerifyRequest = { contactMethod, otp };
    const body: AuthOtpVerifyRequest = {
      phone: contactValue,
      otp: otp
    };

    if (contactMethod === 'email') {
      payload.email = contactValue;
    } else {
      body.phone = contactValue;
      body.otp = otp;
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/verify-otp`, body).pipe(
      finalize(() => { this.isLoading.set(false) })
    );
  }

  saveUserName(name: any): Observable<any> {
    this.isLoading.set(true);

    const body: any = {
      name: name
    };

    return this.http.put<AuthResponse>(`${environment.apiUrl}/user/name`, body).pipe(
      finalize(() => { this.isLoading.set(false) })
    );
  }

  setAuthenticatedUser(user: AuthResponse): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem('token', user.token);
    localStorage.setItem('name', user.user.name);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('user');
  }
}
