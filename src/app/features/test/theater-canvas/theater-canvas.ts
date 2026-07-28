import { Component, inject, signal, computed, OnInit, OnDestroy, NgZone, output, ElementRef, HostListener, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stage } from '../stage/stage';
import { Block } from '../block/block';
import { LayoutService } from '../layout.service';
import type { Seat } from '../../../core/data/test.data';

/** Intrinsic layout width in pixels (matches SCSS .layout width) */
const LAYOUT_WIDTH = 1350;
/** Intrinsic layout height in pixels (matches SCSS .layout height) */
const LAYOUT_HEIGHT = 1400;
/** Viewport width where 1:1 scaling is applied (layout fits natively) */
const NATURAL_BREAKPOINT = 1400;
/** Maximum scale cap on ultra-wide screens */
const MAX_SCALE = 1.3;
/** Minimum scale cap on very small screens */
const MIN_SCALE = 0.3;
/** Horizontal padding on larger screens (each side) */
const DESKTOP_PADDING = 32;

@Component({
  selector: 'app-theater-canvas',
  imports: [CommonModule, Stage, Block],
  templateUrl: './theater-canvas.html',
  styleUrl: './theater-canvas.scss',
})
export class TheaterCanvas implements OnInit, OnDestroy {
  private layout = inject(LayoutService);
  private ngZone = inject(NgZone);
  private hostEl = inject(ElementRef);
  SelectedSeats = output<any[]>();
  blocks = this.layout.generateTheater();

  reservedSeatNumbers = input<string[]>([]);

  /** Active tab: 'STAGE' (default) or 'BAL' */
  protected activeTab = signal<'STAGE' | 'BAL'>('STAGE');

  /** Blocks with reserved seats applied so the template can render locked seats */
  displayBlocks = computed(() => {
    const reserved = new Set(this.reservedSeatNumbers());
    return this.blocks.map(block => ({
      ...block,
      rows: block.rows.map(row => ({
        ...row,
        seats: row.seats.map(seat =>
          // Match against seat.id because the server label (e.g. "STAGE-A14")
          // equals the seat's id, not its seatnumber (e.g. "A14")
          reserved.has(seat.id) ? { ...seat, status: 'reserved' as const } : seat
        )
      }))
    }));
  });

  /** Blocks filtered by the active tab (STAGE or BAL) */
  filteredBlocks = computed(() => {
    const tab = this.activeTab();
    return this.displayBlocks().filter(block =>
      tab === 'STAGE' ? block.label.startsWith('STAGE') : block.label.startsWith('BAL')
    );
  });

  protected selectedSeatIds = signal<string[]>([]);

  /** Number of selected seats */
  protected selectedSeatCount = computed(() => this.selectedSeatIds().length);

  /** Total price of all selected seats (uses ALL blocks, not just the active tab) */
  protected selectedSeatTotal = computed(() => {
    const allSeats = this.displayBlocks().flatMap(b => b.rows.flatMap(r => r.seats));
    return this.selectedSeatIds().reduce((total, seatId) => {
      const seat = allSeats.find(s => s.id === seatId);
      return total + (seat?.price ?? 0);
    }, 0);
  });

  /** Switch the active tab */
  switchTab(tab: 'STAGE' | 'BAL'): void {
    this.activeTab.set(tab);
  }

  /** Scale factor applied to the layout */
  protected scale = 1;

  /** Seat scale multiplier for CSS custom property */
  protected seatScale = 1;

  /** Offset added to each block's x/y when up-scaled */
  protected translateOffset = 0;

  /** Whether the container needs horizontal scroll hints */
  protected isOverflowing = false;

  /** Viewport width state for breakpoint-aware rendering */
  protected viewportWidth = 0;

  /** Touch gesture tracking */
  private touchStartX = 0;
  private touchStartY = 0;
  private touchScrollLeft = 0;
  private touchScrollTop = 0;
  private lastTouchDist = 0;
  private pinchStartScale = 1;
  private isPinching = false;

  private resizeHandler: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;

  ngOnInit(): void {
    this.updateScale();
    this.resizeHandler = () => this.updateScale();
    window.addEventListener('resize', this.resizeHandler);

    // Observe the host element for size changes
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkOverflow();
      });
      this.resizeObserver.observe(this.hostEl.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private updateScale(): void {
    const vw = window.innerWidth;
    this.viewportWidth = vw;

    const availableWidth = vw - DESKTOP_PADDING * 2;
    let newScale: number;
    let newOffset = 0;

    if (vw <= 1024) {
      // Mobile & Tablet: keep full 1:1 scale, no shrinking
      // The layout will overflow horizontally and users scroll to see all seats
      newScale = 1;
    } else if (vw <= NATURAL_BREAKPOINT) {
      // Small desktop to natural: scale down proportionally if needed
      newScale = Math.min(availableWidth / LAYOUT_WIDTH, 1);
    } else if (vw <= 1920) {
      // Desktop to full HD: slight up-scale
      newScale = 1 + (vw - NATURAL_BREAKPOINT) / (1920 - NATURAL_BREAKPOINT) * (MAX_SCALE - 1);
    } else {
      // Ultra-wide: cap at max scale
      newScale = MAX_SCALE;
    }

    // Clamp scale
    newScale = Math.max(Math.min(newScale, MAX_SCALE), MIN_SCALE);

    // Calculate translate offset for up-scaled blocks (to prevent clipping)
    if (newScale > 1) {
      newOffset = (newScale - 1) * 80;
    }

    // Seat scale stays at 1 on mobile/tablet (full size), adapts on desktop+
    const seatScale = vw <= 1024 ? 1 : Math.min(1, Math.max(0.55, newScale * 1.1));

    if (
      newScale !== this.scale ||
      newOffset !== this.translateOffset ||
      seatScale !== this.seatScale
    ) {
      this.ngZone.run(() => {
        this.scale = newScale;
        this.translateOffset = newOffset;
        this.seatScale = seatScale;
        // Set CSS custom property for seat sizing
        this.hostEl.nativeElement.style.setProperty('--seat-scale', seatScale.toString());
      });
    }
  }

  private checkOverflow(): void {
    const layoutContainer = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    if (layoutContainer) {
      this.isOverflowing = layoutContainer.scrollWidth > layoutContainer.clientWidth;
    }
  }

  /** Handle window resize for overflow check */
  @HostListener('window:resize')
  onResize(): void {
    this.checkOverflow();
  }

  // ─── Touch gesture handlers for horizontal scroll and pinch-to-zoom ───

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      // Single finger: track for swipe scroll
      this.isPinching = false;
      this.touchStartX = event.touches[0].pageX;
      this.touchStartY = event.touches[0].pageY;
      const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement;
      if (container) {
        this.touchScrollLeft = container.scrollLeft;
        this.touchScrollTop = container.scrollTop;
      }
    } else if (event.touches.length === 2) {
      // Two fingers: pinch-to-zoom
      this.isPinching = true;
      const dx = event.touches[0].pageX - event.touches[1].pageX;
      const dy = event.touches[0].pageY - event.touches[1].pageY;
      this.lastTouchDist = Math.sqrt(dx * dx + dy * dy);
      this.pinchStartScale = this.scale;
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (this.isPinching && event.touches.length === 2) {
      event.preventDefault();
      const dx = event.touches[0].pageX - event.touches[1].pageX;
      const dy = event.touches[0].pageY - event.touches[1].pageY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (this.lastTouchDist > 0) {
        const pinchFactor = dist / this.lastTouchDist;
        let newScale = this.pinchStartScale * pinchFactor;
        newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
        this.ngZone.run(() => {
          this.scale = newScale;
          const seatScale = Math.min(1, Math.max(0.55, newScale * 1.1));
          this.seatScale = seatScale;
          this.hostEl.nativeElement.style.setProperty('--seat-scale', seatScale.toString());
        });
      }
      return;
    }

    if (event.touches.length !== 1 || this.isPinching) {
      return;
    }

    // Single finger scroll (both directions)
    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement;
    if (!container) return;

    const walkX = event.touches[0].pageX - this.touchStartX;
    const walkY = event.touches[0].pageY - this.touchStartY;

    // Scroll both horizontally and vertically
    container.scrollLeft = this.touchScrollLeft - walkX;
    container.scrollTop = this.touchScrollTop - walkY;
  }

  onTouchEnd(_event: TouchEvent): void {
    this.isPinching = false;
    this.lastTouchDist = 0;
  }

  /** Clear the current seat selection (called by parent after booking/cancel) */
  clearSelection(): void {
    this.selectedSeatIds.set([]);
    this.SelectedSeats.emit([]);
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
      const allSeats = this.displayBlocks().flatMap(b => b.rows.flatMap(r => r.seats));
      const selected = allSeats.filter(s => this.selectedSeatIds().includes(s.id));
      this.SelectedSeats.emit(selected);
    });
  }

}
