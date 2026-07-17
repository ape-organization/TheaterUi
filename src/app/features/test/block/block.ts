import { Component, input, output } from '@angular/core';
import { SeatBlock, Seat } from '../test.data';
import { TestSeat } from '../test-seat/test-seat';
import { Row } from '../row/row';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-block',
  standalone: true,
  imports: [CommonModule, Row],
  templateUrl: './block.html',
  styleUrl: './block.scss',
})
export class Block {
  block = input.required<SeatBlock>();
  selectedSeatIds = input<number[]>([]);
  translateOffset = input<number>(0);

  seatClick = output<Seat>();
}
