import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AllBookingResponse } from '../../../core/models/api.models';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminStatsComponent } from '../admin-stats/admin-stats.component';
import { AdminBookingsTableComponent } from '../admin-bookings-table/admin-bookings-table.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, AdminStatsComponent, AdminBookingsTableComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  bookings: AllBookingResponse[] = [];
  isLoading = true;
  updatingId: string | null = null;
error=signal(false)
errorMsg=signal("")
  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.adminService.getAllRecerivation().subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: () => {
      //  window.alert('فشل تحميل الحجوزات.');
      this.error.set(true)
      this.errorMsg.set('فشل تحميل الحجوزات.')
        this.isLoading = false;
      }
    });
  }

  updateStatus(bookingId: string, status: 'CONFIRMED' ): void {
    this.updatingId = bookingId;
    this.adminService.updateReservationStatus(bookingId, status).subscribe({
      next: () => {
        const booking = this.bookings.find((b) => b.bookingId === bookingId);
        if (booking) {
          booking.status = status;
        }
        this.updatingId = null;
      },
      error: () => {
      //  window.alert('فشل تحديث حالة الحجز.');
        this.error.set(true)
      this.errorMsg.set('فشل تحديث حالة الحجز.')
        this.updatingId = null;
      }
    });
  }
}
