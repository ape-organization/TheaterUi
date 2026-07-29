import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  Balance, CreateMoneyTransferRequest } from '../../../core/models/api.models';
import { AdminService } from '../../../core/services/admin.service';
import { TransfersHeaderComponent } from './transfers-header/transfers-header.component';
import { CreateTransferFormComponent } from './create-transfer-form/create-transfer-form.component';
import { TransfersListComponent } from './transfers-list/transfers-list.component';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, TransfersHeaderComponent, CreateTransferFormComponent, TransfersListComponent],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss'
})
export class TransfersComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  transfers: Balance={balance:0};
  isLoading = true;
  isSubmitting = false;

  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers(): void {
    this.isLoading = true;
    this.adminService.getBalance().subscribe({
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

  createTransfer(request: any): void {
    this.isSubmitting = true;
    console.log(request)
    this.adminService.createTransfer(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.loadTransfers();
      },
      error: () => {
        window.alert('فشل إنشاء التحويل');
        this.isSubmitting = false;
      }
    });
  }
}
