import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllBookingResponse } from '../../../core/models/api.models';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-stats.component.html',
  styleUrl: './admin-stats.component.scss'
})
export class AdminStatsComponent {
 @Input() bookings: AllBookingResponse[] = [];
ngOnChanges(changes: SimpleChanges) {
  }
 

  get totalBookings(): number {
    return this.bookings.length;
  }

  get pendingCount(): number {
    return this.bookings.filter(b => b.status === 'PENDING').length;
  }

  get confirmedCount(): number {
    return this.bookings.filter(b => b.status === 'CONFIRMED').length;
  }

 
}
