import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { BookingRequest, BookingResponse, ReceriveSeat, ReceriveSeatRequest, Seat, UserBooking } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  readonly selectedSeats = signal<Seat[]>([]);
  readonly bookingSummary = signal<BookingResponse | null>(null);
  readonly bookingResponse = signal<ReceriveSeat | null>(null);
  readonly bookings = signal<UserBooking[] | null>(null);
  readonly isLoading = signal(false);

  constructor(private readonly http: HttpClient) {}

  createBooking(request: ReceriveSeatRequest): Observable<ReceriveSeat> {
    this.isLoading.set(true);

    return this.http.post<ReceriveSeat>(`${environment.apiUrl}/seats/reserve`, request).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  /** Fetch all reservations for the current user */
  getBookings(): Observable<UserBooking[]> {
    this.isLoading.set(true);

    return this.http.get<UserBooking[]>(`${environment.apiUrl}/bookings`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  /** Fetch a single reservation by its ID */
  getBookingById(id: number): Observable<UserBooking> {
    this.isLoading.set(true);

    return this.http.get<UserBooking>(`${environment.apiUrl}/bookings/${id}`).pipe(
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

  setBookingResponse(response: ReceriveSeat): void {
    this.bookingResponse.set(response);
  }

  setBookings(bookings: UserBooking[]): void {
    this.bookings.set(bookings);
  }
}
