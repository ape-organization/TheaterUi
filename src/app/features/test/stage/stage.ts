import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stage',
  imports: [],
  templateUrl: './stage.html',
  styleUrl: './stage.scss',
})
export class Stage {
  readonly scale = input<number>(1);
}
