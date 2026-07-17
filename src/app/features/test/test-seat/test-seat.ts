import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seat } from '../test.data';

@Component({
  selector: 'app-test-seat',
  imports: [CommonModule],
  templateUrl: './test-seat.html',
  styleUrl: './test-seat.scss',
})
export class TestSeat {
  seat = input.required<Seat>();
  type = input<'vip' | 'regular'>('regular');
  selectedSeatIds = input<number[]>([]);

  seatClick = output<Seat>();
}
