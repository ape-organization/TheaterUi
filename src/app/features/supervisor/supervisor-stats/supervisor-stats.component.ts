import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorTransfer } from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-supervisor-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supervisor-stats.component.html',
  styleUrl: './supervisor-stats.component.scss'
})
export class SupervisorStatsComponent {
  readonly userService=inject(AuthService);
  @Input() transfers: SupervisorTransfer[] = [];
  
  get balance():number
  {
  var currentUser=this.userService.currentUser()
  //this.balance.set(currentUser?.user)
  console.log(currentUser?.user.balance)
  
return currentUser?.user.balance ??0;
  }
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
