import { Component, inject, Input, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorTransfer } from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { SupervisorService } from '../../../core/services/supervisor.service';

@Component({
  selector: 'app-supervisor-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supervisor-stats.component.html',
  styleUrl: './supervisor-stats.component.scss'
})
export class SupervisorStatsComponent {
  readonly superAdminService=inject(SupervisorService);
  @Input() transfers: SupervisorTransfer[] = [];
    balance=signal(0);
ngOnInit()
{
  this.getBalance()
}
   getBalance()
  {
  this.superAdminService.getUserData().subscribe({
      next: (response: any) => 
        {
          if(response)
          {this.balance.set(response.balance);
          }
        },
      error:()=>{this.balance.set(0)
      }

  //this.balance.set(currentUser?.user)
  })
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
