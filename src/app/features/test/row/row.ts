import { Component, input, output } from '@angular/core';
import { SeatRow, Seat } from '../test.data';
import { TestSeat } from '../test-seat/test-seat';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-row',
  standalone: true,
  imports: [CommonModule, TestSeat],
  templateUrl: './row.html',
  styleUrl: './row.scss',
})
export class Row {
  row = input.required<SeatRow>();
  type = input<'vip' | 'regular'>('regular');
  selectedSeatIds = input<number[]>([]);

  seatClick = output<Seat>();
}
