import { Component } from '@angular/core';


import { buildBlocks } from '../../../core/data/seat-generator';
import {  SeatBlockComponent } from '../seat-block/seat-block';
import { TOP_LAYOUT } from '../../../core/data/top-layout';

@Component({
  selector: 'app-layout',
  imports: [SeatBlockComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
blocks=buildBlocks(TOP_LAYOUT);
}
  