import { Component, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule,HomeHeader,ConfirmBooking,TheaterCanvas],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnInit {
  private readonly eventService = inject(EventService);



  protected readonly seatMap = this.eventService.seatMap;
  protected readonly isLoading = this.eventService.isLoading;

  /** Array of selected seat objects from theater-canvas */
  protected selectedSeats: Seat[] = [];

  /** Whether the confirmation modal is visible */
  protected showConfirmModal = false;

  /** Whether the final success result is shown */
  protected bookingSuccess = false;
  protected bookingMessage = '';

  /** The seat numbers for display in the modal */
  protected selectedSeatNumbers: string[] = [];

  /** The event data for the booking modal */
  protected eventData = this.eventService.selectedEvent;

  ngOnInit(): void {
  this.eventService.getRecivedSeat().subscribe({
      next: (response) => {
        console.log(response)
      }})
     
  }

 

  /** Receives selected seats from theater-canvas child component */
  receiveData(data: any[]): void {
    console.log(data)
    this.selectedSeats = data;
    this.selectedSeatNumbers = data.map(s => s['seatnumber']);
  }

  /** Open the confirmation modal */
  openConfirmModal(): void {
    if (!this.selectedSeats.length) {
      return;
    }
    this.selectedSeatNumbers = this.selectedSeats.map(s => (s as any)['seatnumber']);
    this.showConfirmModal = true;
  }

  /** Close the confirmation modal */
  closeConfirmModal(): void {
    this.showConfirmModal = false;
  }

  /** Handle successful booking */
  onBookingConfirmed(): void {
    this.showConfirmModal = false;
    this.selectedSeats = [];
    this.selectedSeatNumbers = [];
    this.bookingSuccess = true;
    this.bookingMessage = 'رقم الهاتف المسجل';
  }

 

  get totalPrice(): number {
    return (this.selectedSeats as Seat[]).reduce((sum: number, seat: Seat) => sum + seat.price, 0);
  }

  /** Total for the modal display */
  get modalTotalPrice(): number {
    return this.totalPrice;
  }
}
