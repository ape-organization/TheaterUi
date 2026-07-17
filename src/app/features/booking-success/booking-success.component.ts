import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BookingService } from '../../core/services/booking.service';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './booking-success.component.html',
  styleUrl: './booking-success.component.scss'
})
export class BookingSuccessComponent {
  protected readonly booking = inject(BookingService).bookingSummary;
  protected readonly event = inject(EventService).selectedEvent;
}
