import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { BookingService } from '../../core/services/booking.service';
import { AdminService } from '../../core/services/admin.service';
import { ReceriveSeat } from '../../core/models/api.models';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.scss'
})
export class TicketDetailsComponent implements OnInit {

  // =========================================================
  // Signals
  // =========================================================

  protected readonly booking = signal<ReceriveSeat | null>(null);

  protected readonly isLoading = signal(false);

  protected readonly error = signal(false);


  // =========================================================
  // Seats
  // =========================================================

  seats: any[] = [];

  consumedSeats: any[] = [];

  /**
   * Seats selected locally.
   *
   * These are NOT consumed yet.
   */
  selectedSeats: any[] = [];


  // =========================================================
  // Confirmation Dialog
  // =========================================================

  showConfirmDialog = false;


  // =========================================================
  // Services
  // =========================================================

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly bookingService = inject(BookingService);

  private readonly adminService = inject(AdminService);


  // =========================================================
  // Hall Names
  // =========================================================

  private readonly hallNames: Record<string, string> = {
    STAGE: 'الصالة',
    BAL: 'البلكونة'
  };


  // =========================================================
  // Token
  // =========================================================

  token = '';


  // =========================================================
  // On Init
  // =========================================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.token = params.get('token') ?? '';

      this.loadBooking();

    });

  }


  // =========================================================
  // Load Booking
  // =========================================================

  private loadBooking(): void {

    this.error.set(false);

    this.bookingService
      .getBookingByToken(this.token)
      .subscribe({

        next: (data) => {

          const stateBooking =
            data as ReceriveSeat | undefined;

          if (stateBooking) {

            this.booking.set(stateBooking);

            this.processSeats();

            return;

          }

          this.error.set(true);

        },

        error: (error) => {

          console.error(
            'Failed to load booking:',
            error
          );

          this.error.set(true);

        }

      });

  }


  // =========================================================
  // Process Seats
  // =========================================================

  private processSeats(): void {

    const currentBooking = this.booking();

    if (!currentBooking?.seats) {

      this.seats = [];

      this.consumedSeats = [];

      this.selectedSeats = [];

      return;

    }

    this.seats =
      currentBooking.seats ?? [];

    this.consumedSeats =
      currentBooking.consumedSeats ?? [];

    this.selectedSeats = [];

  }


  // =========================================================
  // Select / Unselect Seat
  // =========================================================

  toggleSeatSelection(seat: any): void {

    // Consumed seats cannot be selected again
    if (this.isSeatConsumed(seat)) {

      return;

    }


    const index =
      this.selectedSeats.findIndex(
        selectedSeat =>
          selectedSeat.id === seat.id
      );


    // Already selected → remove it
    if (index !== -1) {

      this.selectedSeats.splice(index, 1);

    }

    // Not selected → select it
    else {

      this.selectedSeats.push(seat);

    }


    // New array reference
    this.selectedSeats = [
      ...this.selectedSeats
    ];

  }


  // =========================================================
  // Is Seat Consumed?
  // =========================================================

  isSeatConsumed(seat: any): boolean {

    return (
      this.booking()?.consumedSeats ?? []
    ).some(
      consumedSeat =>
        consumedSeat.id === seat.id
    );

  }


  // =========================================================
  // Is Seat Selected?
  // =========================================================

  isSeatSelected(seat: any): boolean {

    return this.selectedSeats.some(
      selectedSeat =>
        selectedSeat.id === seat.id
    );

  }


  // =========================================================
  // Open Confirmation Dialog
  // =========================================================

  openConsumeConfirmation(): void {

    if (this.selectedSeats.length === 0) {

      return;

    }

    this.showConfirmDialog = true;

  }


  // =========================================================
  // Cancel Confirmation
  // =========================================================

  cancelConsume(): void {

    this.showConfirmDialog = false;

    // Keep selected seats selected.
    // User can confirm later or unselect them.

  }


  // =========================================================
  // Confirm Consume
  // =========================================================

  confirmConsume(): void {

    const bookingId =
      this.booking()?.id;


    if (!bookingId) {

      console.error(
        'Booking ID is missing.'
      );

      return;

    }


    if (this.selectedSeats.length === 0) {

      return;

    }


    // =====================================================
    // Prepare API body
    // =====================================================

    const body = {

      seatLabels:
        this.selectedSeats.map(
          seat => seat.label
        )

    };


    console.log(
      'Consuming seats:',
      body
    );


    // =====================================================
    // Loading
    // =====================================================

    this.isLoading.set(true);


    // =====================================================
    // API
    // =====================================================

    this.adminService
      .consumeSeats(
        bookingId,
        body
      )
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (data) => {

          console.log(
            'Seats consumed successfully:',
            data
          );


          const currentBooking =
            this.booking();


          if (!currentBooking) {

            this.isLoading.set(false);

            return;

          }


          // Keep a copy before clearing selection
          const seatsToConsume = [
            ...this.selectedSeats
          ];


          // =================================================
          // Add selected seats to consumed seats
          // =================================================

          const updatedConsumedSeats = [

            ...(currentBooking.consumedSeats ?? []),

            ...seatsToConsume

          ];


          // =================================================
          // Update booking
          // =================================================

          this.booking.set({

            ...currentBooking,

            consumedSeats:
              updatedConsumedSeats

          });


          // =================================================
          // Update local array
          // =================================================

          this.consumedSeats =
            updatedConsumedSeats;


          // =================================================
          // Clear selected seats
          // =================================================

          this.selectedSeats = [];


          // =================================================
          // Close dialog
          // =================================================

          this.showConfirmDialog = false;


          // =================================================
          // Stop loading
          // =================================================

          this.isLoading.set(false);

        },


        // =================================================
        // ERROR
        // =================================================

        error: (error) => {

          console.error(
            'Consume seats failed:',
            error
          );

          /*
           * Keep selectedSeats unchanged.
           *
           * This allows the admin to try again.
           */

          this.isLoading.set(false);

        }

      });

  }


  // =========================================================
  // Display Seat Label
  // =========================================================

  displaySeatLabel(label: string): string {

    if (!label.includes('-')) {

      return label;

    }


    const [hall, number] =
      label.split('-');


    return `${
      this.hallNames[hall] ?? hall
    } ${number}`;

  }


  // =========================================================
  // Go Back
  // =========================================================

  goBack(): void {

    if (history.length > 1) {

      history.back();

    }

    else {

      this.router.navigate([
        '/event'
      ]);

    }

  }


  // =========================================================
  // WhatsApp
  // =========================================================

  openWhatsApp(): void {

    const url =
      this.booking()?.paymentLink;


    if (url) {

      window.open(
        url,
        '_blank'
      );

    }

  }

}