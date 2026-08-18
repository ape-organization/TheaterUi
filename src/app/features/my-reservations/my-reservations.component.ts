import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { EventService } from '../../core/services/event.service';
import { UserBooking } from '../../core/models/api.models';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-reservations.component.html',
  styleUrl: './my-reservations.component.scss'
})
export class MyReservationsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
    private readonly userService = inject(UserService);

  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);

  protected readonly bookings = signal<UserBooking[] | null>(null);
  protected readonly isLoading = this.bookingService.isLoading;
  protected readonly errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBookings();
  }
private readonly hallNames: Record<string, string> = {
  STAGE: 'الصالة',
  BAL: 'البلكونة',
};

displaySeatLabel(label: string): string {
  if (!label.includes('-')) {
    return label;
  }

  const [hall, number] = label.split('-');

  return `${this.hallNames[hall] ?? hall} ${number}`;
}
 /*  loadBookings(): void {
    this.errorMsg.set(null);

    // Check if bookings were passed from verify-otp via the service
    const storedBookings = this.bookingService.bookings();
    if (storedBookings && storedBookings.length > 0) {
    
       storedBookings.forEach(booking => {
 booking.seats.forEach(seat => {
  if (seat.label.includes('-')) {
    const [hall, number] = seat.label.split('-');
    seat.label = `${this.hallNames[hall] ?? hall} ${number}`;
  }
});
});
      this.bookings.set(storedBookings);
      return;
    }
console.log("here")
    // Otherwise, fetch from API
    this.userService.GetUserReservation().subscribe({
      next: (data) => {
         data.forEach((booking:any) => {
    booking.seats.forEach((seat:any) => {
  if (seat.label.includes('-')) {
    const [hall, number] = seat.label.split('-');
    seat.label = `${this.hallNames[hall] ?? hall} ${number}`;
  }
});
  });
        this.bookings.set(data);
        this.bookingService.setBookings(data);
      },
      error: () => {
        this.errorMsg.set('حدث خطأ في تحميل الحجوزات');
      }
    });
  } */

  ///
  clearBookings(): void {
  this.bookingService.bookings.set(null);
}
isSeatConsumed(
  booking: UserBooking,
  seatLabel: string
): boolean {

  if (!booking.consumedSeats) {
    return false;
  }

  return booking.consumedSeats.some(
    (seat: any) =>
      this.displaySeatLabel(seat.label) === seatLabel
  );
}

loadBookings(): void {
  this.errorMsg.set(null);

  const storedBookings = this.bookingService.bookings();

  if (storedBookings && storedBookings.length > 0) {
    this.bookings.set(storedBookings);
    // Don't use them again
    this.clearBookings();
    return;
  }

  this.userService.GetUserReservation().subscribe({
    next: (data) => {
      this.bookings.set(data);
     // this.bookingService.setBookings(data);
    },
    error: () => {
      this.errorMsg.set('حدث خطأ في تحميل الحجوزات');
    }
  });
}

  
  /** Navigate to the ticket view for a specific booking */
  viewTicket(booking: any): void {
    this.bookingService.setBookingResponse(booking);
    this.router.navigate(['/ticket']);
  }

  /** Refresh the bookings list */
  refresh(): void {
    this.loadBookings();
  }

  /** Get the number of seats for a booking */
  getSeatsCount(booking: UserBooking): number {
    return booking.seats?.length ?? 0;
  }
}
