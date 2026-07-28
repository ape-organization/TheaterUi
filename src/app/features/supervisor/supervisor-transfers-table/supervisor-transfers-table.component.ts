import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorTransfer } from '../../../core/models/api.models';

@Component({
  selector: 'app-supervisor-transfers-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supervisor-transfers-table.component.html',
  styleUrl: './supervisor-transfers-table.component.scss'
})
export class SupervisorTransfersTableComponent {
  @Input() transfers: SupervisorTransfer[] = [];
  @Input() isLoading = false;
  @Input() updatingId: string | null = null;

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  onConfirm(id: any): void {
    this.confirm.emit(id);
  }

  onCancel(id: any): void {
    this.cancel.emit(id);
  }
}
