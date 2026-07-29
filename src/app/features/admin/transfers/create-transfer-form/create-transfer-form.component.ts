import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  onSubmit(): void {
    console.log(this.transferData)
    if (!this.transferData.amount ) {
    //  window.alert('يرجى إدخال المبلغ واسم المشرف');
      this.error=true;
      this.errorMsg='يرجى إدخال المبلغ'
      return;
    }
    console
    this.createTransfer.emit(this.transferData);
  }

  resetForm(): void {
    this.transferData = { amount: 0 };
  }
}
