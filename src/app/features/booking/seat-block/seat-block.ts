import { Component, computed, input } from '@angular/core';
import { SeatBlock } from '../../../core/data/layout.data';
import { SeatComponent } from '../seat/seat';

@Component({
  selector: 'app-seat-block',
  imports: [SeatComponent

  ],
  templateUrl: './seat-block.html',
  styleUrl: './seat-block.scss',
})
export class SeatBlockComponent {
   block=input.required<SeatBlock>();

    transform=computed(()=>{

        const b=this.block();

        return `translate(${b.x}px,${b.y}px) rotate(${b.rotation}deg)`;

    });
}
