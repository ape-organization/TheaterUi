import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { BookingRequest, BookingResponse, ReceriveSeat, ReceriveSeatRequest, Seat, MoneyTransfer, CreateMoneyTransferRequest } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  readonly selectedSeats = signal<Seat[]>([]);
  readonly bookingSummary = signal<BookingResponse | null>(null);
  readonly isLoading = signal(false);

  constructor(private readonly http: HttpClient) {}

  getAllRecerivation(): Observable<any> {
    this.isLoading.set(true);

    return this.http.get<any>(`${environment.apiUrl}/admin/reservations`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  updateReservationStatus(id: string, status: 'confirmed' | 'cancelled'): Observable<any> {
    this.isLoading.set(true);

    return this.http.patch<any>(`${environment.apiUrl}/admin/reservations/${id}/status`, { status }).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  /** Get all money transfers */
  getTransfers(): Observable<MoneyTransfer[]> {
    this.isLoading.set(true);

    return this.http.get<MoneyTransfer[]>(`${environment.apiUrl}/api/v1/admin/transfers`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  /** Create a new money transfer */
  createTransfer(request: CreateMoneyTransferRequest): Observable<MoneyTransfer> {
    this.isLoading.set(true);

    return this.http.post<MoneyTransfer>(`${environment.apiUrl}/api/v1/admin/transfers`, request).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }
}
