import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateMoneyTransferRequest } from '../../../../core/models/api.models';

@Component({
  selector: 'app-create-transfer-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-transfer-form.component.html',
  styleUrl: './create-transfer-form.component.scss'
})
export class CreateTransferFormComponent {
  @Input() isSubmitting = false;
  //@Output() submit = new EventEmitter<CreateMoneyTransferRequest>();
@Output() createTransfer = new EventEmitter<CreateMoneyTransferRequest>();
  transferData: CreateMoneyTransferRequest = {
    amount: 0
  };
error=false
errorMsg=""

  /** Whether the confirmation dialog is open */
  protected readonly showConfirm = signal(false);

  onSubmit(): void {
    if (!this.transferData.amount ) {
    //  window.alert('يرجى إدخال المبلغ واسم المشرف');
      this.error=true;
      this.errorMsg='يرجى إدخال المبلغ'
      return;
    }
    // Open the confirmation dialog instead of emitting immediately
    this.showConfirm.set(true);
  }

  /** User confirmed the action — proceed with creating the transfer */
  onConfirmTransfer(): void {
    this.showConfirm.set(false);
    this.createTransfer.emit(this.transferData);
    this.transferData.amount = 0;
  }

  /** User cancelled the action — do nothing */
  onCancelTransfer(): void {
    this.showConfirm.set(false);
  }

  resetForm(): void {
    this.transferData = { amount: 0 };
  }
}
