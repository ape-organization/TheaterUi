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
/** Intrinsic layout height for the BAL tab — seats end around y≈430px */
const BAL_LAYOUT_HEIGHT = 460;
/** Maximum scale cap */
const MAX_SCALE = 2.5;
/** Absolute minimum scale floor (fit-scale is the real min, this is a safety clamp) */
const ABSOLUTE_MIN_SCALE = 0.1;

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

  /** Fixed canvas height (px) — calculated once on init from the viewport,
   *  never changed again so zoom never affects the page layout. */
  protected canvasHeight = signal(0);

  /** The minimum zoom level — equal to the fit-scale so the full theater
   *  is always visible and users cannot zoom out past it. */
  private fitScale = 0.5;

  /** Per-tab intrinsic layout height — eliminates white space under seats */
  protected layoutHeight = computed(() =>
    this.activeTab() === 'BAL' ? BAL_LAYOUT_HEIGHT : STAGE_LAYOUT_HEIGHT
  );

  /** Scaled layout dimensions — drives the scrollable area inside the
   *  fixed canvas box so zoomed-in content stays reachable. */
  protected scaledWidth = computed(() => Math.round(LAYOUT_WIDTH * this.scale()));
  protected scaledHeight = computed(() => Math.round(this.layoutHeight() * this.scale()));

  /** Offset added to each block's x/y when up-scaled */
  protected translateOffset = signal(0);

  /** Whether the container needs horizontal scroll hints */
  protected isOverflowing = false;

  /** Viewport width state for breakpoint-aware rendering */
  protected viewportWidth = 0;

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

  private resizeObserver: ResizeObserver | null = null;
  /** Re-initialise the canvas on device orientation change */
  private orientationHandler: (() => void) | null = null;

  ngOnInit(): void {
    // Overflow check only — canvas size/scale are set once in ngAfterViewInit
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.checkOverflow());
      this.resizeObserver.observe(this.hostEl.nativeElement);
    }
    // Recalculate canvas on orientation flip (portrait ↔ landscape)
    this.orientationHandler = () => setTimeout(() => {
      this.initCanvas();
      this.centerScroll();
    }, 150);
    window.addEventListener('orientationchange', this.orientationHandler);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.orientationHandler) {
      window.removeEventListener('orientationchange', this.orientationHandler);
    }
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    setTimeout(() => this.centerScroll(), 80);
  }

  /** Calculate canvas size and fit-scale ONCE from the current viewport.
   *  The canvas height is set so the theater fills all remaining vertical space
   *  on the screen at the moment the page loads. After this call neither the
   *  canvas dimensions nor the base scale ever change automatically — zoom
   *  happens entirely inside the fixed box. */
  private initCanvas(): void {
    const vw = window.innerWidth;
    const vh = (window as any).visualViewport?.height ?? window.innerHeight;
    this.viewportWidth = vw;

    // Measure the container's actual position so we can calculate the
    // remaining vertical space below it (accounting for legend, tabs, etc.)
    const containerEl = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    const topOffset = containerEl
      ? containerEl.getBoundingClientRect().top
      : 180; // fallback estimate
    // Use at least 55% of viewport height so the canvas isn't tiny when the
    // content above (hero + seat-section header + legend/tabs/zoom) is taller
    // than the remaining viewport space.
    const canvasH = Math.max(Math.round(vh * 0.55), 350, Math.round(vh - topOffset - 16));
    const canvasW = this.hostEl.nativeElement.getBoundingClientRect().width || vw;

    this.canvasHeight.set(canvasH);

    // Fit-scale: make the full STAGE layout (the taller tab) visible on load
    const fitW = canvasW / LAYOUT_WIDTH;
    const fitH = canvasH / STAGE_LAYOUT_HEIGHT;
    const fs = Math.max(ABSOLUTE_MIN_SCALE, Math.min(Math.min(fitW, fitH), MAX_SCALE));
    this.fitScale = fs;

    const seatScale = Math.min(1, Math.max(0.4, fs * 1.5));

    this.ngZone.run(() => {
      this.scale.set(fs);
      this.translateOffset.set(0);
      this.seatScale.set(seatScale);
      this.hostEl.nativeElement.style.setProperty('--seat-scale', seatScale.toString());
    });

    this.checkOverflow();
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
    container.scrollLeft = overflow / 2;
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
    let newScale = this.scale() * 1.15;
    newScale = Math.max(this.fitScale, Math.min(newScale, MAX_SCALE));
    if (container) {
      this.applyScale(newScale, container.clientWidth / 2, container.clientHeight / 2);
    } else {
      this.applyScale(newScale);
    }
  }

  /** Zoom out (decrease scale), centered on the visible area */
  zoomOut(): void {
    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    let newScale = this.scale() * (1 / 1.15);
    newScale = Math.max(this.fitScale, Math.min(newScale, MAX_SCALE));
    if (container) {
      this.applyScale(newScale, container.clientWidth / 2, container.clientHeight / 2);
    } else {
      this.applyScale(newScale);
    }
  }

  /** Reset zoom back to the initial fit-scale (full theater visible) */
  resetZoom(): void {
    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    this.applyScale(this.fitScale,
      container ? container.clientWidth / 2 : undefined,
      container ? container.clientHeight / 2 : undefined);
  }

  /** Apply a new scale value and update related state.
   *
   *  Two sources of confusion fixed here:
   *
   *  1. FLEXBOX CENTERING — when the scaled layout is narrower/shorter than the
   *     canvas, the browser flexbox-centers the sizer inside the container.
   *     scrollLeft is still 0, but the sizer's left edge is NOT at x=0.
   *     Using `getBoundingClientRect` gives the sizer's ACTUAL visual position so
   *     the focal-point math is correct in both the overflow and no-overflow cases.
   *
   *  2. TIMING — ngZone.run() updates Angular signals synchronously but the DOM
   *     repaint (new sizer dimensions) happens asynchronously.  We compute the
   *     target scroll analytically (LAYOUT_WIDTH * newScale) so we never have to
   *     read stale DOM measurements inside requestAnimationFrame. */
  private applyScale(newScale: number, focalX?: number, focalY?: number): void {
    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    const sizerEl   = container?.querySelector('.layout-sizer') as HTMLElement | null;
    const oldScale  = this.scale();

    let contentX = 0, contentY = 0;
    let hasFocal = false;

    if (container && sizerEl && focalX !== undefined && focalY !== undefined) {
      // getBoundingClientRect gives the sizer's visual position in the viewport.
      // Subtracting the container's rect yields the sizer's offset from the
      // container's top-left corner *as currently rendered* — this correctly
      // captures flexbox centering (positive offset) and scroll overhang (negative).
      const cRect = container.getBoundingClientRect();
      const sRect = sizerEl.getBoundingClientRect();
      const sizerVisualX = sRect.left - cRect.left; // <0 when scrolled past sizer start
      const sizerVisualY = sRect.top  - cRect.top;

      // Convert focal point (container-relative px) → sizer-local px → layout px
      contentX = (focalX - sizerVisualX) / oldScale;
      contentY = (focalY - sizerVisualY) / oldScale;
      hasFocal = true;
    }

    this.ngZone.run(() => {
      this.scale.set(newScale);
      const seatScale = Math.min(1, Math.max(0.4, newScale * 1.5));
      this.seatScale.set(seatScale);
      this.hostEl.nativeElement.style.setProperty('--seat-scale', seatScale.toString());
    });

    if (hasFocal && container) {
      requestAnimationFrame(() => {
        const cw = container.clientWidth;
        const ch = container.clientHeight;

        // Compute new sizer dimensions analytically (DOM may not have repainted yet)
        const newSizerW = LAYOUT_WIDTH       * newScale;
        const newSizerH = this.layoutHeight() * newScale;

        // If the new sizer fits inside the canvas, flexbox will re-center it.
        // Account for that centering offset so the scroll target is correct.
        const newOffsetX = newSizerW < cw ? (cw - newSizerW) / 2 : 0;
        const newOffsetY = newSizerH < ch ? (ch - newSizerH) / 2 : 0;

        // Scroll so the layout point (contentX, contentY) appears at (focalX, focalY).
        // behavior:'instant' bypasses any scroll-behavior CSS so the correction
        // is applied in the same frame as the scale change.
        container.scrollTo({
          left:     Math.max(0, newOffsetX + contentX * newScale - focalX!),
          top:      Math.max(0, newOffsetY + contentY * newScale - focalY!),
          behavior: 'instant',
        });
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
      newScale = Math.max(this.fitScale, Math.min(newScale, MAX_SCALE));
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
        newScale = Math.max(this.fitScale, Math.min(newScale, MAX_SCALE));
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
