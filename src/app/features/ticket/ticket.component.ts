import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
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
  private readonly router = inject(Router);

  /** The booking being viewed — falls back to the bookingResponse signal */
  protected readonly currentBooking = signal<UserBooking | null>(null);
 navigation = this.router.currentNavigation();

 ticket = history.state.user;;
seats:any=''
  ngOnInit(): void {
    console.log(this.booking())
      this.loadBooking();
    
  }
moveToHome()
{
  this.router.navigate(['/event'])
}
  /** Fetch a specific booking by ID when navigating from the reservations list */
  private loadBooking(): void {
   
        if (this.booking()&&this.booking()?.seats) {
        this.seats=this.booking()?.seats.map((seat: any) => {
  const [section, seatNumber] = seat.label.split('-');

  const sectionName = section === 'STAGE'
    ? 'صالة'
    : section === 'BAL'
      ? 'بلكونة'
      : section;

  return `${sectionName} (${seatNumber})`;
})
        }
    
  }
}
