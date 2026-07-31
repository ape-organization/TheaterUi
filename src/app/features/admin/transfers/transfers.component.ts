import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  Balance, CreateMoneyTransferRequest } from '../../../core/models/api.models';
import { AdminService } from '../../../core/services/admin.service';
import { TransfersHeaderComponent } from './transfers-header/transfers-header.component';
import { CreateTransferFormComponent } from './create-transfer-form/create-transfer-form.component';
import { TransfersListComponent } from './transfers-list/transfers-list.component';
import { TitleStrategy } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, TransfersHeaderComponent, CreateTransferFormComponent, TransfersListComponent],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss'
})
export class TransfersComponent implements OnInit {
 
  private readonly adminService = inject(AdminService);

error=signal(false)
errorMsg=signal("")
  transfers=signal({balance:0});
  isLoading = true;
  isSubmitting =signal( false);

  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers(): void {
    this.isLoading = true;
            this.error.set(false)

    this.adminService.getBalance().subscribe({
      next: (data) => {
        this.transfers.set( data);
        this.isLoading = false;
      },
      error: () => {
        
        this.error.set(true)
this.errorMsg.set('فشل إنشاء التحويل')
        this.isLoading = false;
      }
    });
  }

  createTransfer(request: any): void {
            this.error.set(false)

    this.isSubmitting.set( true);
    this.adminService.createTransfer(request).subscribe({
      next: (res:any) => {
        this.isSubmitting .set(false);
        this.loadTransfers();
      },
      error: () => {
        this.error.set(true)
this.errorMsg.set('فشل إنشاء التحويل')
        this.isSubmitting.set(false);
      }
    });
  }
}
