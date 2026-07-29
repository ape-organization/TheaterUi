import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { BookingRequest, BookingResponse, ReceriveSeat, ReceriveSeatRequest, Seat, CreateMoneyTransferRequest, Balance, AllBookingResponse } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  readonly selectedSeats = signal<Seat[]>([]);
  readonly bookingSummary = signal<BookingResponse | null>(null);
  readonly isLoading = signal(false);

  constructor(private readonly http: HttpClient) {}

  getAllRecerivation(): Observable<AllBookingResponse[]> {
    this.isLoading.set(true);

    return this.http.get<AllBookingResponse[]>(`${environment.apiUrl}/admin/reservations`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  updateReservationStatus(id: any, status: 'CONFIRMED' ): Observable<any> {
    this.isLoading.set(true);

    return this.http.post<any>(`${environment.apiUrl}/admin/reservations/${id}/status`,"").pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  /** Get all money transfers */
  getBalance(): Observable<Balance> {
    this.isLoading.set(true);

    return this.http.get<Balance>(`${environment.apiUrl}/admin/balance`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  /** Create a new money transfer */
  createTransfer(request: CreateMoneyTransferRequest): Observable<any> {
    this.isLoading.set(true);
    return this.http.post<any>(`${environment.apiUrl}/admin/transfers`, request).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }
}
