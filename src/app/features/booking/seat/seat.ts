import { Component, computed, input } from '@angular/core';
import { Seat } from '../../../core/data/layout.data';
@Component({
  selector: 'app-seat',
  imports: [],
  templateUrl: './seat.html',
  styleUrl: './seat.scss',
})
export class SeatComponent {
seat = input.required<Seat>();

  cssClass = computed(() => {

    switch (this.seat().status) {

      case 'available':
        return 'available';

      case 'reserved':
        return 'reserved';

      case 'selected':
        return 'selected';

      case 'vip':
        return 'vip';

      default:
        return '';

    }

  });
}
