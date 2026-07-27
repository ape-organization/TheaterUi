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
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.bookingService.setBookings(bookings);
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
        this.errorMsg.set('حدث خطأ في تحميل الحجوزات. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  /** Navigate to the ticket view for a specific booking */
  viewTicket(booking: UserBooking): void {
    // Store the selected booking so the ticket component can use it immediately
    this.bookingService.setBookingResponse(booking as any);

    // If event info is available, set it on the event service
    if (booking.eventTitle) {
      this.eventService.setSelectedEvent({
        id: 0,
        title: booking.eventTitle,
        date: booking.eventDate || '',
        time: booking.eventTime || '',
        location: '',
        ticketPrice: 0,
        description: '',
        imageUrl: ''
      });
    }

    this.router.navigate(['/ticket', booking.id]);
  }

  /** Refresh the bookings list */
  refresh(): void {
    this.loadBookings();
  }

  /** Get the number of seats for a booking */
  getSeatsCount(booking: UserBooking): number {
    return booking.seats?.length ?? 0;
  }

  /** Format a date string for display */
  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /** Check if a booking is expired */
  isExpired(booking: UserBooking): boolean {
    if (!booking.expiresAt) return false;
    return new Date(booking.expiresAt) < new Date();
  }
}
