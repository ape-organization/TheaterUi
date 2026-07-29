import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllBookingResponse } from '../../../core/models/api.models';

@Component({
  selector: 'app-admin-bookings-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-bookings-table.component.html',
  styleUrl: './admin-bookings-table.component.scss'
})
export class AdminBookingsTableComponent {
  @Input() bookings: AllBookingResponse[] = [];
  @Input() isLoading = false;
  @Input() updatingId: number | null = null;

  @Output() refresh = new EventEmitter<void>();
  @Output() updateStatus = new EventEmitter<{ bookingId: number; status: 'CONFIRMED' }>();

  onRefresh(): void {
    this.refresh.emit();
  }

  onUpdateStatus(bookingId: number, status: 'CONFIRMED'): void {
    this.updateStatus.emit({ bookingId, status });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      default: return 'status-pending';
    }
  }
}
