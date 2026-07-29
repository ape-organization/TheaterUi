import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { EventService } from '../../core/services/event.service';
import { UserBooking } from '../../core/models/api.models';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-reservations.component.html',
  styleUrl: './my-reservations.component.scss'
})
export class MyReservationsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);

  protected readonly bookings = signal<UserBooking[] | null>(null);
  protected readonly isLoading = this.bookingService.isLoading;
  protected readonly errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.errorMsg.set(null);

    // Check if bookings were passed from verify-otp via the service
    const storedBookings = this.bookingService.bookings();
    if (storedBookings && storedBookings.length > 0) {
      this.bookings.set(storedBookings);
      return;
    }

    // Otherwise, fetch from API
    this.bookingService.getBookings().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.bookingService.setBookings(data);
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
