import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { BookingRequest, BookingResponse, Seat } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  readonly selectedSeats = signal<Seat[]>([]);
  readonly bookingSummary = signal<BookingResponse | null>(null);
  readonly isLoading = signal(false);

  constructor(private readonly http: HttpClient) {}

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    this.isLoading.set(true);

    return this.http.post<BookingResponse>('/api/bookings', request).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  setSelectedSeats(seats: Seat[]): void {
    this.selectedSeats.set(seats);
  }

  clearSelection(): void {
    this.selectedSeats.set([]);
  }

  setBookingSummary(summary: BookingResponse): void {
    this.bookingSummary.set(summary);
  }
}
