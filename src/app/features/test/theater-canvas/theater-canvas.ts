import { Component, inject, signal, computed, OnInit, OnDestroy, NgZone, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Stage } from '../stage/stage';
import { Block } from '../block/block';
import { LayoutService } from '../layout.service';
import type { Seat } from '../test.data';

/** Only start scaling when viewport is wider than this */
const TRIGGER_WIDTH = 1800;
/** Maximum scale to cap layout on ultra-wide screens */
const MAX_SCALE = 1.3;

@Component({
  selector: 'app-theater-canvas',
  imports: [CommonModule, TranslatePipe, Stage, Block],
  templateUrl: './theater-canvas.html',
  styleUrl: './theater-canvas.scss',
})
export class TheaterCanvas implements OnInit, OnDestroy {
  private layout = inject(LayoutService);
  private ngZone = inject(NgZone);
  SelectedSeats = output<any[]>();
  blocks = this.layout.generateTheater();

  protected selectedSeatIds = signal<number[]>([]);

  /** Number of selected seats */
  protected selectedSeatCount = computed(() => this.selectedSeatIds().length);

  /** Total price of all selected seats */
  protected selectedSeatTotal = computed(() => {
    const allSeats = this.blocks.flatMap(b => b.rows.flatMap(r => r.seats));
    return this.selectedSeatIds().reduce((total, seatId) => {
      const seat = allSeats.find(s => s.id === seatId);
      return total + (seat?.price ?? 0);
    }, 0);
  });

  /** Scale factor applied to the layout (>= 1, only grows on very wide screens) */
  protected scale = 1;

  /** Offset added to each block's x/y when scaled (100px per unit of scale above 1) */
  protected translateOffset = 0;

  private resizeHandler: (() => void) | null = null;

  ngOnInit(): void {
    this.updateScale();
    this.resizeHandler = () => this.updateScale();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private updateScale(): void {
    const viewportWidth = window.innerWidth;
    // Only start scaling when viewport is wider than TRIGGER_WIDTH
    const newScale = viewportWidth > TRIGGER_WIDTH
      ? Math.min(viewportWidth / TRIGGER_WIDTH, MAX_SCALE)
      : 1;
    // When scaled, add 100px offset to each block's x/y for each unit of scale above 1
    const newOffset = newScale > 1 ? (newScale - 1) * 100 : 0;
    if (newScale !== this.scale || newOffset !== this.translateOffset) {
      this.ngZone.run(() => {
        this.scale = newScale;
        this.translateOffset = newOffset;
      });
    }
  }

  toggleSeatSelection(seat: Seat): void {
    if (seat.status === 'reserved') {
      return;
    }
    const current = this.selectedSeatIds();
    const next = current.includes(seat.id)
      ? current.filter((seatId) => seatId !== seat.id)
      : [...current, seat.id];
    this.selectedSeatIds.set(next);
    // Emit the full seat objects to parent (uses setTimeout to let signal settle)
    setTimeout(() => {
      const allSeats = this.blocks.flatMap(b => b.rows.flatMap(r => r.seats));
      const selected = allSeats.filter(s => this.selectedSeatIds().includes(s.id));
      this.SelectedSeats.emit(selected);
    });
  }

}
