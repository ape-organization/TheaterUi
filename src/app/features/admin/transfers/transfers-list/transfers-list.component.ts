import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Balance } from '../../../../core/models/api.models';

@Component({
  selector: 'app-transfers-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transfers-list.component.html',
  styleUrl: './transfers-list.component.scss'
})
export class TransfersListComponent {
  @Input() transfers: Balance = {
    balance: 0
  };
  @Input() isLoading = false;
}
