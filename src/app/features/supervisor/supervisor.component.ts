import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorTransfer } from '../../core/models/api.models';
import { SupervisorService } from '../../core/services/supervisor.service';
import { SupervisorHeaderComponent } from './supervisor-header/supervisor-header.component';
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

  transfers: SupervisorTransfer[] = [];
  isLoading = true;
  updatingId: string | null = null;
error=false
errorMsg=""
  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers(): void {
    this.isLoading = true;
    this.supervisorService.getTransfers().subscribe({
      next: (data) => {
        this.transfers = data;
        this.isLoading = false;
      },
      error: () => {
       // window.alert('فشل تحميل التحويلات');
        this.error=true
        this.errorMsg='فشل تحميل التحويلات'
        this.isLoading = false;
      }
    });
  }

  confirmTransfer(id: any): void {
    this.updatingId = id;
    this.supervisorService.updateTransferStatus(id, 'CONFIRMED').subscribe({
      next: () => {
        const transfer = this.transfers.find(t => t.id === id);
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
