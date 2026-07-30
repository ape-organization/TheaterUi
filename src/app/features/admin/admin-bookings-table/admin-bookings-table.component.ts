import { Component, EventEmitter, Input, Output, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllBookingResponse } from '../../../core/models/api.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

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
    this.updateStatus.emit({ bookingId, status });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      default: return 'status-pending';
    }
  }
}
