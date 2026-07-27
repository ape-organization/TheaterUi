import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { BookingRequest, BookingResponse, ReceriveSeat, ReceriveSeatRequest, Seat } from '../models/api.models';
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
   updateRecerivationStatus(id:any): Observable<any> {
    this.isLoading.set(true);

    return this.http.post<any>(`${environment.apiUrl}/admin/reservations/{id}/confirm`,id).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }
}