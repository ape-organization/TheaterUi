import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  private readonly router = inject(Router);

  /** Input: selected seats from parent */
  selectedSeats = input<Seat[]>([]);
  /** Input: the event details */
  event = input<EventResponse | null>(null);

  /** Input: optional note attached by the user */
  notes = input<string>('');

  /** Output: emitted when modal should close */
  closeModal = output<void>();
  /** Output: emitted when booking is confirmed successfully.
   *  Carries the seat labels (ids) that were just booked so the parent
   *  can lock them in the theater canvas immediately. */
  bookingConfirmed = output<string[]>();

  error = false;
  errorMsg = '';
  isBookingLoading = signal(false);

  /** Current user info */
  protected readonly currentUser = this.authService.currentUser;

  /** Derived: seat numbers for display */
  get selectedSeatNumbers(): string[] {
   
   // return this.selectedSeats().map(s => (s as any)['seatnumber'] ?? s.label ?? '');
  return  this.selectedSeats().map(seat => {
  const section = seat.id.startsWith('STAGE') ? 'الصالة' : 'البلكون';
  const label=(seat as any)['seatnumber'] ?? seat.label ?? ''
  return `${section} (${label})`;
});
  }

  /** Derived: total price */
  get modalTotalPrice(): number {
    return this.selectedSeats().reduce((sum, seat) => sum + (seat.price ?? 0), 0);
  }

  /** User name from auth */
  get userName(): string {
    return this.currentUser()?.user?.name ?? '';
  }

  /** Close the confirmation modal (cancel) — no seats are locked */
  closeConfirmModal(): void {
    this.isBookingLoading.set(false);
    this.bookingService.clearSelection();
    this.bookingConfirmed.emit([]);
  }

  /** Confirm and submit the booking */
  confirmBooking(): void {
    this.isBookingLoading.set(true);
    this.error = false;

    const seats = this.selectedSeats();
    if (!seats.length) {
      return;
    }
//Extract for next step   ---show ticket
const allSeats=this.selectedSeats().map(seat => {
  const section = seat.id.startsWith('STAGE') ? 'الصالة' : 'البلكون';
  const label=(seat as any)['seatnumber'] ?? seat.label ?? ''
  return `${section} (${label})`;
});


    // Extract seat labels for the API request

    const seatLabels = seats.map(s => (s as any)['id'] ?? s.label ?? '');
   
    const request: ReceriveSeatRequest = {
      "seatLabels": seatLabels,
      "notes": this.notes()?.trim() || undefined
    };
    this.bookingService.createBooking(request).subscribe({
      next: (response) => {
        this.isBookingLoading.set(false);
        this.bookingService.clearSelection();
        // Store the booking response so the ticket page can display it
        this.bookingService.setBookingResponse(response);
        // Emit the booked seat labels so the parent can lock them in the theater
        this.bookingConfirmed.emit(seatLabels);
        // Navigate to the ticket page
        this.router.navigate(['/ticket']);
      },
      error: (err) => {
        this.isBookingLoading.set(false);
        this.error = true;
        this.errorMsg = 'لم يتم إنشاء الحجز.';
      }
    });
  }
}
