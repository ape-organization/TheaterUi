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
  @Output() submit = new EventEmitter<CreateMoneyTransferRequest>();

  transferData: CreateMoneyTransferRequest = {
    amount: 0,
    toSupervisorName: '',
    notes: ''
  };

  onSubmit(): void {
    if (!this.transferData.amount || !this.transferData.toSupervisorName) {
      window.alert('يرجى إدخال المبلغ واسم المشرف');
      return;
    }
    this.submit.emit(this.transferData);
  }

  resetForm(): void {
    this.transferData = { amount: 0, toSupervisorName: '', notes: '' };
  }
}
