import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AllBookingResponse } from '../../../core/models/api.models';
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
   statusOrder: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1
};
  private readonly adminService = inject(AdminService);
 // bookings: AllBookingResponse[] = [];
 bookings = signal<AllBookingResponse[]>([]);
  isLoading = true;
  updatingId: number | null = null;
  error = signal(false);
  errorMsg = signal("");

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.adminService.getAllRecerivation().subscribe({
      next: (data) => {
        console.log(data);
     //  this.bookings.set(data as AllBookingResponse[]);
     this.bookings.set(
  (data as AllBookingResponse[]).sort(
    (a, b) => this.statusOrder[a.status] - this.statusOrder[b.status]
  )
);
        console.log(this.bookings)
        this.isLoading = false;
      },
      error: () => {
        this.error.set(true);
        this.errorMsg.set('فشل تحميل الحجوزات');
        this.isLoading = false;
      }
    });
  }

  updateStatus(bookingId: number, status: 'CONFIRMED'): void {
    this.updatingId = bookingId;
    this.adminService.updateReservationStatus(bookingId, status).subscribe({
      next: (res:any) => {
        console.log(res)
        console.log(bookingId)
  this.bookings.update(bookings =>
        bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status }
            : booking
        )
         .sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === 'PENDING' ? -1 : 1;
    })
      );

        this.updatingId = null;
      },
      error: () => {
        this.error.set(true);
        this.errorMsg.set('فشل تحديث حالة الحجز');
        this.updatingId = null;
      }
    });
  }
}
