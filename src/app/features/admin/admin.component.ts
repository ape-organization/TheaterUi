import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { AllBookingResponse, UpdateBookingStatusRequest } from '../../core/models/api.models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  bookings: AllBookingResponse[] = [];
  isLoading = true;
  updatingId: string | null = null;

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    this.loadBookings();
  }
private cdr = inject(ChangeDetectorRef);
  loadBookings(): void {
    this.isLoading = true;
    this.http.get<AllBookingResponse[]>('/api/admin/bookings').subscribe({
      next: (data) => {
        console.log(data)
        this.bookings = data;
        console.log(this.bookings.length)
        this.isLoading = false;
          this.cdr.detectChanges();
      },
      error: () => {
        window.alert('Failed to load bookings.');
        this.isLoading = false;
      }
    });
    console.log(this.bookings.length)
  }

  updateStatus(bookingId: string, status: 'confirmed' | 'cancelled'): void {
    this.updatingId = bookingId;
    this.http.put(`/api/admin/bookings/${bookingId}`, { status } as UpdateBookingStatusRequest).subscribe({
      next: () => {
        const booking = this.bookings.find((b) => b.bookingId === bookingId);
        if (booking) {
          booking.status = status;
        }
        this.updatingId = null;
      },
      error: () => {
        window.alert('Failed to update booking status.');
        this.updatingId = null;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}