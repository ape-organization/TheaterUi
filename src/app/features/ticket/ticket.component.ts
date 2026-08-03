import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { EventService } from '../../core/services/event.service';
import { UserBooking } from '../../core/models/api.models';
import QRCode from 'qrcode';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss'
})
export class TicketComponent implements OnInit {
  protected readonly qrCodeDataUrl = signal<string>('');
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
openWhatsApp(): void {
  const url = this.booking()?.paymentLink; // or your WhatsApp link
  window.open(url, '_blank');
}
  ngOnInit(): void {
      this.loadBooking();
    this.generateQrCode();
  }
  private async generateQrCode(): Promise<void> {
  const booking = this.booking();

  if (!booking || booking.status !== 'CONFIRMED') {
    return;
  }

/*  const qrValue = `
🎭 تذكرة دخول المسرح

رقم الحجز: ${booking.id}

الاسم: ${booking.user.name}

المقاعد:
${booking.seats
  .map(s => this.displaySeatLabel(s.label))
  .join('، ')}

الحالة: ${booking.status === 'CONFIRMED' ? 'مؤكد' : 'قيد الانتظار'}
`; */
const qrValue = `${environment.uiApiUrl}#ticket/${booking.ticketToken}`;
  const url = await QRCode.toDataURL(qrValue);

  this.qrCodeDataUrl.set(url);
}
moveToHome()
{
  this.router.navigate(['/event'])
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
  /** Fetch a specific booking by ID when navigating from the reservations list */
 /*  private loadBooking(): void {
   
        if (this.booking()&&this.booking()?.seats) {
    this.seats = this.booking()?.seats.map((seat: any) => {
  if (!seat.label.includes('-')) {
    return seat.label;
  }

  const [section, seatNumber] = seat.label.split('-');

  const sectionName = section === 'STAGE'
    ? 'صالة'
    : section === 'BAL'
      ? 'بلكونة'
      : section;

  return `${sectionName} (${seatNumber})`;
});
        }
    
  } */
private loadBooking(): void {
  const booking = this.booking();

  if (!booking?.seats) {
    return;
  }

  this.seats = booking.seats.map((seat: any) =>
    this.displaySeatLabel(seat.label)
  );
}
      }
