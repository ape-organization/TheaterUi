import { Component, inject, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../core/services/event.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import type { Seat } from '../../core/models/api.models';
import { TheaterCanvas } from '../test/theater-canvas/theater-canvas';
import { UserInfo } from '../../shared/components/user-info/user-info';
import { HomeHeader } from '../home-header/home-header';
import { ConfirmBooking } from '../confirm-booking/confirm-booking';
import { single } from 'rxjs';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule, HomeHeader, ConfirmBooking, TheaterCanvas],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnInit {
  private readonly eventService = inject(EventService);

  protected readonly seatMap = this.eventService.seatMap;
  protected readonly isLoading = this.eventService.isLoading;

  /** Array of selected seat objects from theater-canvas */
  protected selectedSeats: Seat[] = [];
//selectedSeats = signal<Seat[]>([]);
  /** Whether the confirmation modal is visible */
  protected showConfirmModal = false;

  /** Whether the final success result is shown */
  protected bookingSuccess = false;
  protected bookingMessage = '';

  /** The seat numbers for display in the modal */
  protected selectedSeatNumbers: string[] = [];

  /** The event data for the booking modal */
  protected eventData = this.eventService.selectedEvent;

  /**
   * Seat IDs (labels) received from the server that are PENDING or CONFIRMED.
   * These seats are locked — users cannot select them.
   * The server returns objects like { id, label, status } where `label`
   * (e.g. "STAGE-A14") matches the theater seat's `id`.
   */
  protected reservedSeatNumbers = signal<string[]>([]);

  /**
   * Map of seat id -> server status ('PENDING' | 'CONFIRMED') so the theater
   * canvas can color each locked seat according to its real status.
   */
  protected seatStatusMap = signal<Record<string, string>>({});

  error=false;
errorMsg=""
  /** Reference to the theater canvas so we can clear its selection */
  @ViewChild(TheaterCanvas) theaterCanvas!: TheaterCanvas;

  receivedSeats: any[] = [];

  ngOnInit(): void {
  
    this.getReceivedSeats();
  }

  getReceivedSeats()
  {
    this.eventService.getRecivedSeat().subscribe({
      next: (response: any) => {
        // Keep seats that are PENDING or CONFIRMED — both are locked for the user
        this.receivedSeats = response.filter(
          (x: any) => x.status === 'PENDING' || x.status === 'CONFIRMED'
        );

        // Extract the seat label (e.g. "STAGE-A14") which matches the
        // theater seat's `id`, so the canvas can lock those seats
        this.reservedSeatNumbers.set(
          this.receivedSeats.map((x: any) => x['seatnumber'] ?? x['label'])
        );

        // Build a map of seat id -> server status for status-based coloring
        const statusMap: Record<string, string> = {};
        this.receivedSeats.forEach((x: any) => {
          const seatId = x['seatnumber'] ?? x['label'];
          if (seatId) {
            statusMap[seatId] = x.status;
          }
        });
        this.seatStatusMap.set(statusMap);
      },
      error: (err) => {
        console.error('Failed to load reserved seats:', err);
      }
    });
  }
  /** Receives selected seats from theater-canvas child component */
  receiveData(data: any[]): void {
    this.selectedSeats=data;
    this.selectedSeatNumbers = data.map((s) => s['seatnumber']);

 this.selectedSeatLabels = data.map(seat => {
    const hall = this.hallNames[seat.id.split('-')[0]] ?? '';
    return `${hall} ${seat.seatnumber}`;
  });

  }

  /** Open the confirmation modal */
  openConfirmModal(): void {
    this.error=false
    if (!this.selectedSeats.length) {
      return;
    }
     if (this.selectedSeats.length>=20) {
      this.error=true;
      this.errorMsg='لا يمكن حجز اكثر من 20 مقعد في التذكره الواحده'
      return;
    }
    this.selectedSeatNumbers = this.selectedSeats.map((s) => (s as any)['seatnumber']);
    this.showConfirmModal = true;
    console.log(this.selectedSeatNumbers);
  }

  /** Close the confirmation modal */
  closeConfirmModal(): void {
    this.showConfirmModal = false;
    console.log(this.selectedSeatNumbers);
  }

  /** Handle successful booking or cancel — close modal, clear selection, allow re-picking.
   *  When seatLabels are provided (from a confirmed booking), the newly booked
   *  seats are immediately locked in the theater canvas. */
  onBookingConfirmed(seatLabels: string[]): void {
    // Lock the newly booked seats so they can't be selected again
    if (seatLabels.length > 0) {
      this.reservedSeatNumbers.update(current =>
        [...new Set([...current, ...seatLabels])]
      );
    }
    this.showConfirmModal = false;
    this.selectedSeats = [];
    this.selectedSeatNumbers = [];
    this.bookingSuccess = false;
    this.bookingMessage = '';
    // Clear the theater canvas selection so the user can pick any other seats
    this.theaterCanvas?.clearSelection();
  }

private readonly hallNames: Record<string, string> = {
  STAGE: 'الصالة',
  BAL: 'البلكونة',
};
protected selectedSeatLabels: string[] = [];

  get totalPrice(): number {
    return (this.selectedSeats as Seat[]).reduce((sum: number, seat: Seat) => sum + seat.price, 0);
  }

  /** Total for the modal display */
  get modalTotalPrice(): number {
    return this.totalPrice;
  }
}
