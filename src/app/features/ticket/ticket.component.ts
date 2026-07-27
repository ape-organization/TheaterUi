import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { EventService } from '../../core/services/event.service';
import { UserBooking } from '../../core/models/api.models';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss'
})
export class TicketComponent implements OnInit {
  protected readonly booking = inject(BookingService).bookingResponse;
  protected readonly event = inject(EventService).selectedEvent;

  private readonly bookingService = inject(BookingService);
  private readonly eventService = inject(EventService);
  private readonly route = inject(ActivatedRoute);

  /** The booking being viewed — falls back to the bookingResponse signal */
  protected readonly currentBooking = signal<UserBooking | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBooking(+id);
    }
  }

  /** Fetch a specific booking by ID when navigating from the reservations list */
  private loadBooking(id: number): void {
    this.bookingService.getBookingById(id).subscribe({
      next: (booking) => {
        this.bookingService.setBookingResponse(booking as any);
        this.currentBooking.set(booking);

        // If event info is available in the booking, set it on the event service
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
      },
      error: (err) => {
        console.error('Failed to load booking:', err);
      }
    });
  }
}
