import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorTransfer } from '../../core/models/api.models';
import { SupervisorService } from '../../core/services/supervisor.service';
import { SupervisorStatsComponent } from './supervisor-stats/supervisor-stats.component';
import { SupervisorTransfersTableComponent } from './supervisor-transfers-table/supervisor-transfers-table.component';

@Component({
  selector: 'app-supervisor',
  standalone: true,
  imports: [CommonModule, SupervisorStatsComponent, SupervisorTransfersTableComponent],
  templateUrl: './supervisor.component.html',
  styleUrl: './supervisor.component.scss'
})
export class SupervisorComponent implements OnInit {
  private readonly supervisorService = inject(SupervisorService);
 //transfers: SupervisorTransfer[] = [];
transfers = signal<SupervisorTransfer[]>([]); 
 isLoading = true;
  updatingId: string | null = null;
error=signal( false)
errorMsg=signal("")
  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers(): void {
    this.isLoading = true;
    this.supervisorService.getTransfers().subscribe({
      next: (data) => {
        this.transfers.set( data);
        this.isLoading = false;
      },
      error: () => {
       // window.alert('فشل تحميل التحويلات');
        this.error.set(true)
        this.errorMsg.set('فشل تحميل التحويلات')
        this.isLoading = false;
      }
    });
  }

  confirmTransfer(id: any): void {
    this.updatingId = id;
    this.supervisorService.updateTransferStatus(id, 'CONFIRMED').subscribe({
      next: () => {
        const transfer = this.transfers().find(t => t.id === id);
        if (transfer) transfer.status = 'CONFIRMED';
        this.updatingId = null;
      },
      error: () => {
        window.alert('فشل تأكيد الاستلام');
        this.updatingId = null;
      }
    });
  }

  
}
