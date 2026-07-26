import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../core/services/event.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import type { Seat } from '../../core/models/api.models';
import { BookingRequest } from '../../core/models/api.models';
import { TheaterCanvas } from '../test/theater-canvas/theater-canvas';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule, TheaterCanvas],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly event = this.eventService.selectedEvent;
  protected readonly seatMap = this.eventService.seatMap;
  protected readonly isLoading = this.eventService.isLoading;
  protected readonly isBookingLoading = this.bookingService.isLoading;

  /** Array of selected seat objects from theater-canvas */
  protected selectedSeats: Seat[] = [];

  /** Whether the confirmation modal is visible */
  protected showConfirmModal = false;

  /** Whether the final success result is shown */
  protected bookingSuccess = false;
  protected bookingMessage = '';

  /** The seat numbers for display in the modal */
  protected selectedSeatNumbers: string[] = [];

  /** User info */
  protected userName = '';
  protected userChurch = '';

  /** Whether the user info modal is shown (on first load) */
  protected showUserInfoModal = true;

  ngOnInit(): void {
    const cachedEvent = this.eventService.selectedEvent();
    if (!cachedEvent) {
      this.eventService.getEvent(1).subscribe({
        next: (response) => {
          this.eventService.setSelectedEvent(response);
          this.eventService.getSeatMap(1).subscribe({
            next: (seatMap) => {
              this.eventService.setSeatMap(seatMap);
            },
            error: () => window.alert('تعذر تحميل معلومات المقاعد.')
          });
        },
        error: () => window.alert('تعذر تحميل الفعالية حالياً.')
      });
      return;
    }

    this.eventService.getSeatMap(1).subscribe({
      next: (seatMap) => this.eventService.setSeatMap(seatMap),
      error: () => window.alert('تعذر تحميل معلومات المقاعد.')
    }); 
  }

  /** Save user info and close the modal */
  saveUserInfo(): void {
    if (!this.userName.trim() || !this.userChurch.trim()) {
      window.alert('يرجى إدخال الاسم والكنيسة للمتابعة');
      return;
    }
    this.showUserInfoModal = false;
  }

  /** Receives selected seats from theater-canvas child component */
  receiveData(data: any[]): void {
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

  /** Confirm and submit the booking */
  confirmBooking(): void {
    if (!this.selectedSeats.length) {
      return;
    }

    const currentUser = this.authService.currentUser();
    const contactMethod = currentUser?.contactMethod ?? 'phone';
    const contactValue = currentUser?.email ?? currentUser?.phoneNumber ?? '';

    const request: BookingRequest = {
      eventId: this.event()?.id ?? 1,
      seatIds: this.selectedSeats.map((seat) => seat.id),
      contactMethod,
      contactValue,
      name: this.userName,
      church: this.userChurch
    };

    this.bookingService.createBooking(request).subscribe({
      next: (response) => {
        this.bookingService.setBookingSummary(response);
        this.showConfirmModal = false;
        this.bookingSuccess = true;
        this.bookingMessage = contactValue;

        // Clear seat selection after successful booking
        this.selectedSeats = [];
        this.bookingService.clearSelection();
      },
      error: () => window.alert('لم يتم إنشاء الحجز.')
    });
  }

  get totalPrice(): number {
    return (this.selectedSeats as Seat[]).reduce((sum: number, seat: Seat) => sum + seat.price, 0);
  }

  /** Total for the modal display */
  get modalTotalPrice(): number {
    return this.totalPrice;
  }
}