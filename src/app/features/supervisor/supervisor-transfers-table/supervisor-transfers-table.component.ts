import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
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
  @Input() updatingId: any | 0 = 0;

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  /** Pending confirmation request (null when dialog is closed) */
  protected readonly pendingConfirm = signal<string | null>(null);

  onConfirm(id: any): void {
    // Open the confirmation dialog instead of emitting immediately
    this.pendingConfirm.set(id);
  }

  /** User confirmed the action — proceed with confirming the transfer */
  onConfirmTransfer(): void {
    const pending = this.pendingConfirm();
    if (pending !== null) {
      this.confirm.emit(pending);
    }
    this.pendingConfirm.set(null);
  }

  /** User cancelled the action — do nothing */
  onCancelTransfer(): void {
    this.pendingConfirm.set(null);
  }

  onCancel(id: any): void {
    this.cancel.emit(id);
  }
}
