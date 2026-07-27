import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceriveSeat, ReceriveSeatRequest, Seat, EventResponse } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-confirm-booking',
  imports: [CommonModule],
  templateUrl: './confirm-booking.html',
  styleUrl: './confirm-booking.scss',
})
export class ConfirmBooking {
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);

  /** Input: selected seats from parent */
  selectedSeats = input<Seat[]>([]);
  /** Input: the event details */
  event = input<EventResponse | null>(null);

  /** Output: emitted when modal should close */
  closeModal = output<void>();
  /** Output: emitted when booking is confirmed successfully */
  bookingConfirmed = output<void>();

  error = false;
  errorMsg = '';
  isBookingLoading = signal(false);

  /** Current user info */
  protected readonly currentUser = this.authService.currentUser;

  /** Derived: seat numbers for display */
  get selectedSeatNumbers(): string[] {
    return this.selectedSeats().map(s => (s as any)['seatnumber'] ?? s.label ?? '');
  }

  /** Derived: total price */
  get modalTotalPrice(): number {
    return this.selectedSeats().reduce((sum, seat) => sum + (seat.price ?? 0), 0);
  }

  /** User name from auth */
  get userName(): string {
    return this.currentUser()?.user?.name ?? '';
  }



  /** Close the confirmation modal */
  closeConfirmModal(): void {
    
        this.isBookingLoading.set(false);
        this.bookingService.clearSelection();
        this.bookingConfirmed.emit();
  }

  /** Confirm and submit the booking */
  confirmBooking(): void {
    this.isBookingLoading.set(true);
    this.error = false;

    const seats = this.selectedSeats();
    if (!seats.length) {
      return;
    }

    // Extract seat labels for the API request
    const seatLabels = seats.map(s => (s as any)['id'] ?? s.label ?? '');
    console.log(seats)
    console.log((seatLabels))
    const request: ReceriveSeatRequest = { "seatLabels":seatLabels };
console.log(request)
    this.bookingService.createBooking(request).subscribe({
      next: (response) => {
        console.log('Booking response:', response);
        this.isBookingLoading.set(false);
        this.bookingService.clearSelection();
        this.bookingConfirmed.emit();
      },
      error: (err) => {
        console.error('Booking error:', err);
        this.isBookingLoading.set(false);
        this.error = true;
        this.errorMsg = 'لم يتم إنشاء الحجز.';
      }
    });
  }
}
