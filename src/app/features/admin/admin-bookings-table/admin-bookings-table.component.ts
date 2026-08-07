import { Component, EventEmitter, Input, Output, signal, computed, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AllBookingResponse } from '../../../core/models/api.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { BookingService } from '../../../core/services/booking.service';

@Component({
  selector: 'app-admin-bookings-table',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './admin-bookings-table.component.html',
  styleUrl: './admin-bookings-table.component.scss'
})
export class AdminBookingsTableComponent {
//  @Input() bookings: AllBookingResponse[] = [];
bookings = input<any[]>([]);  
@Input() isLoading = false;
  @Input() updatingId: number | null = null;

  @Output() refresh = new EventEmitter<void>();
  @Output() updateStatus = new EventEmitter<{ bookingId: number; status: 'CONFIRMED' }>();

  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);

  /** Navigate to the ticket details page with the selected booking data */
  viewTicket(booking: any): void {
    this.bookingService.setBookingResponse(booking as any);
    this.router.navigate(['/ticket'], { state: { booking } });
  }

  /** Pending confirmation request (null when dialog is closed) */
  protected readonly pendingConfirm = signal<{ bookingId: number; status: 'CONFIRMED' } | null>(null);

  /** Number of bookings shown per page */
  protected readonly pageSize = 10;

  /** Current page (1-based) */
  protected readonly currentPage = signal(1);

  /** Bookings for the current page only */
protected readonly paginatedBookings = computed(() => {
  const start = (this.currentPage() - 1) * this.pageSize;
  return this.bookings().slice(start, start + this.pageSize);
});

  onRefresh(): void {
    this.refresh.emit();
  }

  onUpdateStatus(bookingId: number, status: 'CONFIRMED'): void {
    // Open the confirmation dialog instead of emitting immediately
    this.pendingConfirm.set({ bookingId, status });
  }

  /** User confirmed the action — proceed with the status update */
  onConfirmUpdate(): void {
    const pending = this.pendingConfirm();
    if (pending) {
      this.updateStatus.emit(pending);
    }
    this.pendingConfirm.set(null);
  }

  /** User cancelled the action — do nothing */
  onCancelUpdate(): void {
    this.pendingConfirm.set(null);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  /** Open a WhatsApp chat for the given phone number (prepends "2" to the number) */
  openWhatsApp(phone: string): void {
    const number = '2' + phone;
    window.open(`https://wa.me/${number}`, '_blank');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      default: return 'status-pending';
    }
  }
}
