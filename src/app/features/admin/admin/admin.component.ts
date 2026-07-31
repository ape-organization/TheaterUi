import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AllBookingResponse } from '../../../core/models/api.models';
import { AdminStatsComponent } from '../admin-stats/admin-stats.component';
import { AdminBookingsTableComponent } from '../admin-bookings-table/admin-bookings-table.component';
import { SupervisorService } from '../../../core/services/supervisor.service';
import { UserService } from '../../../core/services/user.service';

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
     //  this.bookings.set(data as AllBookingResponse[]);
   /*   this.bookings.set(
  (data as AllBookingResponse[]).sort(
    (a, b) => this.statusOrder[a.status] - this.statusOrder[b.status]
  )
); */
/* this.bookings.set(
  [...(data as AllBookingResponse[])].sort((a, b) => {
    // First: sort by status
    const statusCompare =
      this.statusOrder[a.status] - this.statusOrder[b.status];

    if (statusCompare !== 0) {
      return statusCompare;
    }

    // Then: newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })
); */
        
this.bookings.set(
  [...(data as AllBookingResponse[])]
    .map(booking => ({
      ...booking,
      isExpired: new Date(booking.expiresAt).getTime() <= Date.now()
    }))
    .sort((a, b) => {
      const statusCompare =
        this.statusOrder[a.status] - this.statusOrder[b.status];

      if (statusCompare !== 0) {
        return statusCompare;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
);

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
        if(res){
      
  this.bookings.update(bookings =>
  bookings
    .map(booking =>
      booking.id === bookingId
        ? { ...booking, status }
        : booking
    )
    .sort((a, b) => {
      // First: status
      if (a.status !== b.status) {
        return a.status === 'PENDING' ? -1 : 1;
      }

      // Second: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
);

        this.updatingId = null;
}
      },
      error: () => {
        this.error.set(true);
        this.errorMsg.set('فشل تحديث حالة الحجز');
        this.updatingId = null;
      }
    }); 

 
  }
}
