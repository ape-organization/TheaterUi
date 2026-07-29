import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { AuthOtpVerifyRequest, AuthRequest, AuthResponse, LoginRequest, OtpVerifyRequest, Reserivation } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  readonly currentUser = signal<AuthResponse | null>(null);
  readonly isAuthenticated = signal(false);
  readonly isLoading = signal(false);

  constructor(private readonly http: HttpClient) {}

  GetUserReservation(): Observable<Reserivation> {
    this.isLoading.set(true);
   
    return this.http.get<any>(`${environment.apiUrl}/user/reservations`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }
}