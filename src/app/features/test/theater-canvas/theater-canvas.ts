import { Component, inject, signal, computed, OnInit, OnDestroy, AfterViewInit, NgZone, output, ElementRef, HostListener, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stage } from '../stage/stage';
import { Block } from '../block/block';
import { LayoutService } from '../layout.service';
import type { Seat, SeatStatus } from '../../../core/data/test.data';

/** Intrinsic layout width in pixels (matches SCSS .layout width) */
const LAYOUT_WIDTH = 1350;
/** Intrinsic layout height for the STAGE tab — seats end around y≈935px */
const STAGE_LAYOUT_HEIGHT = 1000;
/** Intrinsic layout height for the BAL tab — seats end around y≈540px */
const BAL_LAYOUT_HEIGHT = 620;
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
export class TheaterCanvas implements OnInit, OnDestroy, AfterViewInit {
  private layout = inject(LayoutService);
  private ngZone = inject(NgZone);
  private hostEl = inject(ElementRef);
  SelectedSeats = output<any[]>();
  blocks = this.layout.generateTheater();

  reservedSeatNumbers = input<string[]>([]);

  /** Map of seat id -> server status ('PENDING' | 'CONFIRMED') for status coloring */
  seatStatusMap = input<Record<string, string>>({});

  /** Active tab: 'STAGE' (default) or 'BAL' */
  protected activeTab = signal<'STAGE' | 'BAL'>('STAGE');

  /** Blocks with reserved seats applied so the template can render locked seats */
  displayBlocks = computed(() => {
    const reserved = new Set(this.reservedSeatNumbers());
    const statusMap = this.seatStatusMap();
    return this.blocks.map(block => ({
      ...block,
      rows: block.rows.map(row => ({
        ...row,
        seats: row.seats.map(seat => {
          // Match against seat.id because the server label (e.g. "STAGE-A14")
          // equals the seat's id, not its seatnumber (e.g. "A14")
          if (reserved.has(seat.id)) {
            const serverStatus = statusMap[seat.id];
            // Map server status to seat status for status-based coloring
            const mappedStatus: SeatStatus =
              serverStatus === 'PENDING' ? 'pending' :
              serverStatus === 'CONFIRMED' ? 'confirmed' :
              'reserved';
            return { ...seat, status: mappedStatus };
          }
          return seat;
        })
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
    // Re-center so the newly shown tab starts from the middle on mobile.
    setTimeout(() => this.centerScroll(), 50);
  }

  /** Scale factor applied to the layout */
  protected scale = signal(1);

  /** Seat scale multiplier for CSS custom property */
  protected seatScale = signal(1);

  /** Per-tab intrinsic layout height — eliminates white space under seats */
  protected layoutHeight = computed(() =>
    this.activeTab() === 'BAL' ? BAL_LAYOUT_HEIGHT : STAGE_LAYOUT_HEIGHT
  );

  /** Scaled layout dimensions — drives the scrollable area size so that
   *  zoomed-in content stays reachable (CSS transforms don't affect layout
   *  box size, so we expose the real scaled size to a sizer wrapper). */
  protected scaledWidth = computed(() => Math.round(LAYOUT_WIDTH * this.scale()));
  protected scaledHeight = computed(() => Math.round(this.layoutHeight() * this.scale()));

  /** Offset added to each block's x/y when up-scaled */
  protected translateOffset = signal(0);

  /** Whether the container needs horizontal scroll hints */
  protected isOverflowing = false;

  /** Viewport width state for breakpoint-aware rendering */
  protected viewportWidth = 0;

  /** Whether the user has manually adjusted zoom (prevents updateScale from overriding it) */
  private userHasZoomed = false;

  /** Whether the user is currently panning (mouse drag) */
  protected isPanning = signal(false);

  /** Touch gesture tracking */
  private touchStartX = 0;
  private touchStartY = 0;
  private touchScrollLeft = 0;
  private touchScrollTop = 0;
  private lastTouchDist = 0;
  private pinchStartScale = 1;
  private isPinching = false;

  /** Whether a touch is currently active (prevents mouse drag interference on touch devices) */
  private isTouching = false;

  /** Mouse drag state */
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartScrollLeft = 0;
  private dragStartScrollTop = 0;

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

  ngAfterViewInit(): void {
    // Center the theatre horizontally on open so mobile/RTL users start at the
    // middle and can slide both left and right to reach all seats.
    setTimeout(() => this.centerScroll(), 50);
  }

  private updateScale(): void {
    const vw = window.innerWidth;
    this.viewportWidth = vw;

    const availableWidth = vw - DESKTOP_PADDING * 2;
    let newScale: number;
    let newOffset = 0;

    if (vw <= 1024) {
      // On mobile/tablet, don't override a scale the user set manually via zoom buttons.
      if (this.userHasZoomed) {
        this.checkOverflow();
        return;
      }
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
      newScale !== this.scale() ||
      newOffset !== this.translateOffset() ||
      seatScale !== this.seatScale()
    ) {
      this.ngZone.run(() => {
        this.scale.set(newScale);
        this.translateOffset.set(newOffset);
        this.seatScale.set(seatScale);
        // Set CSS custom property for seat sizing
        this.hostEl.nativeElement.style.setProperty('--seat-scale', seatScale.toString());
      });
      // On mobile/tablet the layout overflows the viewport; keep it centered
      // after rescaling (e.g. when narrowing the window from desktop to mobile).
      if (vw <= 1024) {
        setTimeout(() => this.centerScroll(), 50);
      }
    }
  }

  private checkOverflow(): void {
    const layoutContainer = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    if (layoutContainer) {
      this.isOverflowing = layoutContainer.scrollWidth > layoutContainer.clientWidth;
    }
  }

  /** Center the theatre on the stage (المسرح) so the page opens showing it,
   *  letting the user slide left and right to reach all seats.
   *  Only adjusts horizontal scroll — never touches vertical page scroll. */
  private centerScroll(): void {
    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    if (!container) return;

    // If the layout fits the viewport, nothing to center.
    if (container.scrollWidth <= container.clientWidth) return;

    const stage = container.querySelector('.stage') as HTMLElement | null;
    if (stage) {
      // Use rendered rects so CSS transforms (scale) and RTL are accounted for.
      const cRect = container.getBoundingClientRect();
      const sRect = stage.getBoundingClientRect();
      // Horizontal distance to shift so the stage center aligns with the
      // container's visible center.
      const delta = (sRect.left + sRect.width / 2) - (cRect.left + cRect.width / 2);
      // In RTL, scrollLeft is negative in Chrome/Edge/Firefox (0 = right edge),
      // positive in Safari. Adding the delta works for both because the sign of
      // scrollLeft matches the coordinate system of getBoundingClientRect.
      container.scrollLeft += delta;
      return;
    }

    // Fallback: center on the layout middle if the stage isn't found.
    const overflow = container.scrollWidth - container.clientWidth;
    const center = overflow / 2;
    const isRTL = getComputedStyle(container).direction === 'rtl';
    if (isRTL) {
      container.scrollLeft = -center;
      if (container.scrollLeft === 0) {
        container.scrollLeft = center;
      }
    } else {
      container.scrollLeft = center;
    }
  }

  /** Handle window resize for overflow check */
  @HostListener('window:resize')
  onResize(): void {
    this.checkOverflow();
  }

  // ─── Zoom Controls ───

  /** Zoom in (increase scale), centered on the visible area */
  zoomIn(): void {
    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    let newScale = this.scale() * 1.1;
    newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
    this.userHasZoomed = true;
    if (container) {
      this.applyScale(newScale, container.clientWidth / 2, container.clientHeight / 2);
    } else {
      this.applyScale(newScale);
    }
  }

  /** Zoom out (decrease scale), centered on the visible area */
  zoomOut(): void {
    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    let newScale = this.scale() * 0.9;
    newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
    this.userHasZoomed = true;
    if (container) {
      this.applyScale(newScale, container.clientWidth / 2, container.clientHeight / 2);
    } else {
      this.applyScale(newScale);
    }
  }

  /** Reset zoom to natural 1:1 scale */
  resetZoom(): void {
    this.userHasZoomed = false;
    this.applyScale(1);
  }

  /** Apply a new scale value and update related state.
   *  If focalX/focalY are provided (relative to the container's visible area),
   *  the zoom centers on that point so the content under it stays in place
   *  instead of jumping to the corner. */
  private applyScale(newScale: number, focalX?: number, focalY?: number): void {
    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    const oldScale = this.scale();

    // Calculate the content point under the focal point before zooming
    let contentX = 0, contentY = 0;
    let hasFocal = false;
    if (container && focalX !== undefined && focalY !== undefined) {
      contentX = (container.scrollLeft + focalX) / oldScale;
      contentY = (container.scrollTop + focalY) / oldScale;
      hasFocal = true;
    }

    this.ngZone.run(() => {
      this.scale.set(newScale);
      const seatScale = Math.min(1, Math.max(0.55, newScale * 1.1));
      this.seatScale.set(seatScale);
      this.hostEl.nativeElement.style.setProperty('--seat-scale', seatScale.toString());
    });

    // Adjust scroll to keep the focal point stable after the DOM updates
    if (hasFocal && container) {
      requestAnimationFrame(() => {
        container.scrollLeft = contentX * newScale - focalX!;
        container.scrollTop = contentY * newScale - focalY!;
      });
    }
  }

  // ─── Mouse Drag-to-Pan ───

  /** Start mouse drag (pan) — skipped on touch devices to avoid interference */
  onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return; // Only left click
    if (this.isTouching) return; // Skip on touch devices
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement;
    if (container) {
      this.dragStartScrollLeft = container.scrollLeft;
      this.dragStartScrollTop = container.scrollTop;
    }
  }

  /** Handle mouse move during drag (on document so it works outside the container) */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    // Only start panning if movement exceeds a small threshold
    if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;

    this.isPanning.set(true);

    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement;
    if (!container) return;

    // Pan both horizontally and vertically so zoomed-in seats stay reachable
    container.scrollLeft = this.dragStartScrollLeft - deltaX;
    container.scrollTop = this.dragStartScrollTop - deltaY;
  }

  /** End mouse drag */
  @HostListener('document:mouseup', ['$event'])
  onMouseUp(_event: MouseEvent): void {
    this.isDragging = false;
    this.isPanning.set(false);
  }

  // ─── Mouse Wheel Zoom (Ctrl + Wheel) ───

  /** Handle mouse wheel — Ctrl+wheel zooms toward the cursor, otherwise default scroll */
  onWheel(event: WheelEvent): void {
    if (event.ctrlKey) {
      event.preventDefault();
      const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
      if (!container) return;

      // Focal point = cursor position relative to the container's visible area
      const rect = container.getBoundingClientRect();
      const focalX = event.clientX - rect.left;
      const focalY = event.clientY - rect.top;

      const delta = -event.deltaY;
      const zoomFactor = delta > 0 ? 1.1 : 0.9;
      let newScale = this.scale() * zoomFactor;
      newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
      this.applyScale(newScale, focalX, focalY);
    }
  }

  // ─── Touch gesture handlers for horizontal scroll and pinch-to-zoom ───

  onTouchStart(event: TouchEvent): void {
    this.isTouching = true;
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
      this.pinchStartScale = this.scale();
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (this.isPinching && event.touches.length === 2) {
      event.preventDefault();
      const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
      if (!container) return;

      // Focal point = midpoint between the two fingers, relative to the container
      const rect = container.getBoundingClientRect();
      const focalX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left;
      const focalY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top;

      const dx = event.touches[0].pageX - event.touches[1].pageX;
      const dy = event.touches[0].pageY - event.touches[1].pageY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (this.lastTouchDist > 0) {
        const pinchFactor = dist / this.lastTouchDist;
        let newScale = this.pinchStartScale * pinchFactor;
        newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
        this.applyScale(newScale, focalX, focalY);
      }
      return;
    }

    if (event.touches.length !== 1 || this.isPinching) {
      return;
    }

    // On all screen sizes let the browser handle native scrolling:
    //   - horizontal swipe scrolls the theatre left/right
    //   - vertical swipe scrolls the whole page (theatre is part of page flow)
    // This avoids trapping the user inside a nested theatre scroll.
    return;
  }

  onTouchEnd(_event: TouchEvent): void {
    this.isTouching = false;
    this.isPinching = false;
    this.lastTouchDist = 0;
  }

  /** Clear the current seat selection (called by parent after booking/cancel) */
  clearSelection(): void {
    this.selectedSeatIds.set([]);
    this.SelectedSeats.emit([]);
  }

  toggleSeatSelection(seat: Seat): void {
    // Locked seats (reserved, pending, confirmed) cannot be selected
    if (seat.status === 'reserved' || seat.status === 'pending' || seat.status === 'confirmed') {
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