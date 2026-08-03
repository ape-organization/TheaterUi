import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { ReceriveSeat } from '../../core/models/api.models';
import QRCode from 'qrcode';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.scss'
})
export class TicketDetailsComponent implements OnInit {
  protected readonly booking = signal<ReceriveSeat | null>(null);
  protected readonly qrCodeDataUrl = signal<string>('');
  protected readonly isLoading = signal(false);
  protected readonly error = signal(false);

  seats: string[] = [];

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);

  private readonly hallNames: Record<string, string> = {
    STAGE: 'الصالة',
    BAL: 'البلكونة',
  };

  token = '';
  ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
      this.token = params.get('token') ?? '';

      // Call your API here
          this.loadBooking();

    });
  }

  private loadBooking(): void {
    // First, try to get the booking data from router state
    this.bookingService.getBookingByToken(this.token).subscribe({
      next: (data) => {
const stateBooking = data as ReceriveSeat | undefined;

    if (stateBooking) {
      this.booking.set(stateBooking);
      this.processSeats();
      return;
    }

  /*   // Fall back to BookingService.bookingResponse signal
    const serviceBooking = this.bookingService.bookingResponse();
    if (serviceBooking) {
      this.booking.set(serviceBooking);
      this.processSeats();
      this.generateQrCode();
      return;
    } */

    // No data available
    this.error.set(true);

      },
      error:()=>{
         // No data available
    this.error.set(true);
      }})
    
  }

  private processSeats(): void {
    const booking = this.booking();
    if (!booking?.seats) {
      return;
    }
    this.seats = booking.seats.map(seat => this.displaySeatLabel(seat.label));
  }



  displaySeatLabel(label: string): string {
    if (!label.includes('-')) {
      return label;
    }
    const [hall, number] = label.split('-');
    return `${this.hallNames[hall] ?? hall} ${number}`;
  }

  goBack(): void {
    if (history.length > 1) {
      history.back();
    } else {
      this.router.navigate(['/event']);
    }
  }

  openWhatsApp(): void {
    const url = this.booking()?.paymentLink;
    if (url) {
      window.open(url, '_blank');
    }
  }
}