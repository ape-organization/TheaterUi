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
  imports: [CommonModule, SupervisorHeaderComponent, SupervisorStatsComponent, SupervisorTransfersTableComponent],
  templateUrl: './supervisor.component.html',
  styleUrl: './supervisor.component.scss'
})
export class SupervisorComponent implements OnInit {
  private readonly supervisorService = inject(SupervisorService);

  transfers: SupervisorTransfer[] = [];
  isLoading = true;
  updatingId: string | null = null;

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
        window.alert('فشل تحميل التحويلات');
        this.isLoading = false;
      }
    });
  }

  confirmTransfer(id: string): void {
    this.updatingId = id;
    this.supervisorService.updateTransferStatus(id, 'confirmed').subscribe({
      next: () => {
        const transfer = this.transfers.find(t => t.id === id);
        if (transfer) transfer.status = 'confirmed';
        this.updatingId = null;
      },
      error: () => {
        window.alert('فشل تأكيد الاستلام');
        this.updatingId = null;
      }
    });
  }

  cancelTransfer(id: string): void {
    this.updatingId = id;
    this.supervisorService.updateTransferStatus(id, 'cancelled').subscribe({
      next: () => {
        const transfer = this.transfers.find(t => t.id === id);
        if (transfer) transfer.status = 'cancelled';
        this.updatingId = null;
      },
      error: () => {
        window.alert('فشل إلغاء التحويل');
        this.updatingId = null;
      }
    });
  }
}
