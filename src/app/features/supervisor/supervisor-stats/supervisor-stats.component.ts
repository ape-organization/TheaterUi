import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorTransfer } from '../../../core/models/api.models';

@Component({
  selector: 'app-supervisor-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supervisor-stats.component.html',
  styleUrl: './supervisor-stats.component.scss'
})
export class SupervisorStatsComponent {
  @Input() transfers: SupervisorTransfer[] = [];

  get pendingCount(): number {
    return this.transfers.filter(t => t.status === 'PENDING').length;
  }

  get confirmedCount(): number {
    return this.transfers.filter(t => t.status === 'CONFIRMED').length;
  }

  get totalAmount(): number {
    return this.transfers
      .filter(t => t.status === 'CONFIRMED')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
