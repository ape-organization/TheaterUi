import { Component, inject, signal, computed, OnInit, OnDestroy, AfterViewInit, NgZone, output, ElementRef, HostListener, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stage } from '../stage/stage';
import { Block } from '../block/block';
import { LayoutService } from '../layout.service';
import type { Seat, SeatStatus } from '../../../core/data/test.data';

/** Intrinsic layout width in pixels (matches SCSS .layout width) */
const LAYOUT_WIDTH = 1350;
/** Intrinsic layout height in pixels for STAGE tab */
const LAYOUT_HEIGHT_STAGE = 1000;
/** Intrinsic layout height in pixels for BAL tab (shorter layout) */
const LAYOUT_HEIGHT_BAL = 650;
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

  /** The scale that fits all seats in the current tab into the viewport.
   * Recalculated on init, tab switch, and resize so resetZoom can return to it. */
  private fitScale = signal(1);

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
    // Recalculate fit-to-view for the new tab so all seats are visible by default,
    // then the user can zoom in as needed.
    setTimeout(() => {
      this.updateScale();
      this.centerScroll();
    }, 50);
  }

  /** Scale factor applied to the layout */
  protected scale = signal(1);

  /** Seat scale multiplier for CSS custom property */
  protected seatScale = signal(1);

  /** Layout height adapts to the active tab so BAL (shorter) doesn't waste space */
  protected layoutHeight = computed(() =>
    this.activeTab() === 'STAGE' ? LAYOUT_HEIGHT_STAGE : LAYOUT_HEIGHT_BAL
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

  /** Double-tap-to-zoom tracking */
  private lastTapTime = 0;
  private touchStartClientX = 0;
  private touchStartClientY = 0;
  private readonly DOUBLE_TAP_DELAY = 300;
  private readonly DOUBLE_TAP_MAX_MOVE = 10;

  /** Suppresses the next seat toggle when a double-tap-to-zoom is detected,
   *  so zooming doesn't accidentally select/deselect the seat under the tap. */
  private suppressNextSeatToggle = false;

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
    // Recalculate fit-to-view after the view is ready (container has dimensions)
    // so all seats are visible by default; users can zoom in as needed.
    setTimeout(() => {
      this.updateScale();
      this.centerScroll();
    }, 50);
  }

  /**
   * Calculate the fit-to-view scale so ALL seats in the active tab are visible
   * by default. The layout is scaled to fit within both the available width
   * and a responsive target height. Users can then zoom in to see individual seats.
   */
  private updateScale(): void {
    const vw = window.innerWidth;
    this.viewportWidth = vw;

    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;

    // Available width: use the container's client width if available, otherwise
    // estimate from the viewport minus desktop padding.
    const availableWidth = container?.clientWidth ?? (vw - DESKTOP_PADDING * 2);

    // Target height: responsive — larger on desktop (more screen space),
    // smaller on mobile. This ensures all seats are visible at a reasonable
    // size on every screen without page scroll.
    // Use the container's actual client height when available (the container
    // now has a fixed CSS height, so this is the real usable height).
    // Fallback to a viewport-based estimate before the view is ready.
    const targetHeight = vw <= 1024
      ? window.innerHeight * 0.6   // Mobile/Tablet: 60vh
      : window.innerHeight * 0.8;  // Desktop: 80vh (taller area = bigger seats)
    const availableHeight = container?.clientHeight ?? targetHeight;
    const layoutH = this.layoutHeight();

    // Fit-to-view: scale so the entire layout (all seats) fits within both
    // the available width AND the available height. The smaller scale wins so
    // nothing is clipped. Users can then zoom in as needed.
    const fitScaleWidth = availableWidth / LAYOUT_WIDTH;
    const fitScaleHeight = availableHeight / layoutH;
    let newScale = Math.min(fitScaleWidth, fitScaleHeight);

    // Clamp scale
    newScale = Math.max(Math.min(newScale, MAX_SCALE), MIN_SCALE);

    // Store the fit scale so resetZoom() can return to it
    this.fitScale.set(newScale);

    // No translate offset needed when fitting to view (scale ≤ 1)
    let newOffset = 0;
    if (newScale > 1) {
      newOffset = (newScale - 1) * 80;
    }

    // Seat scale adapts to the zoom level
    const seatScale = Math.min(1, Math.max(0.55, newScale * 1.1));

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
      // Re-center after rescaling so the theatre stays centered.
      setTimeout(() => this.centerScroll(), 50);
    }
  }

  private checkOverflow(): void {
    const layoutContainer = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    if (layoutContainer) {
      this.isOverflowing = layoutContainer.scrollWidth > layoutContainer.clientWidth;
    }
  }

  /** Center the theatre on the stage so the page opens showing it,
   *  letting the user slide left and right to reach all seats.
   *  Only adjusts horizontal scroll — never touches vertical page scroll.
   *  Theatre data is always LTR regardless of the page language. */
  private centerScroll(): void {
    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    if (!container) return;

    // If the layout fits the viewport, nothing to center.
    if (container.scrollWidth <= container.clientWidth) return;

    const stage = container.querySelector('.stage') as HTMLElement | null;
    if (stage) {
      // Use rendered rects so CSS transforms (scale) are accounted for.
      const cRect = container.getBoundingClientRect();
      const sRect = stage.getBoundingClientRect();
      // Horizontal distance to shift so the stage center aligns with the
      // container's visible center.
      const delta = (sRect.left + sRect.width / 2) - (cRect.left + cRect.width / 2);
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
    const { focalX, focalY } = this.getCenterFocal();
    let newScale = this.scale() * 1.1;
    newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
    this.applyScale(newScale, focalX, focalY);
  }

  /** Zoom out (decrease scale), centered on the visible area */
  zoomOut(): void {
    const { focalX, focalY } = this.getCenterFocal();
    let newScale = this.scale() * 0.9;
    newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
    this.applyScale(newScale, focalX, focalY);
  }

  /** Reset zoom to the fit-to-view scale (show all seats), centered on the visible area */
  resetZoom(): void {
    const { focalX, focalY } = this.getCenterFocal();
    this.applyScale(this.fitScale(), focalX, focalY);
  }

  /** Get the focal point at the center of the container's visible area */
  private getCenterFocal(): { focalX: number; focalY: number } {
    const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
    if (container) {
      return { focalX: container.clientWidth / 2, focalY: container.clientHeight / 2 };
    }
    return { focalX: 0, focalY: 0 };
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
      // Update translate offset for up-scaled blocks (to prevent clipping)
      const newOffset = newScale > 1 ? (newScale - 1) * 80 : 0;
      this.translateOffset.set(newOffset);
      this.hostEl.nativeElement.style.setProperty('--seat-scale', seatScale.toString());
    });

    // Adjust scroll to keep the focal point stable after the DOM updates.
    // Disable smooth scroll temporarily so the adjustment is instant and
    // the focal point doesn't appear to drift during a scroll animation.
    if (hasFocal && container) {
      const prevScrollBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = 'auto';
      requestAnimationFrame(() => {
        container.scrollLeft = contentX * newScale - focalX!;
        container.scrollTop = contentY * newScale - focalY!;
        container.style.scrollBehavior = prevScrollBehavior;
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
      // Single finger: track for swipe scroll and double-tap detection
      this.isPinching = false;
      this.touchStartX = event.touches[0].pageX;
      this.touchStartY = event.touches[0].pageY;
      this.touchStartClientX = event.touches[0].clientX;
      this.touchStartClientY = event.touches[0].clientY;
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

  onTouchEnd(event: TouchEvent): void {
    // Detect double-tap-to-zoom (single-finger taps that didn't move much)
    if (!this.isPinching && event.changedTouches.length === 1) {
      const tapX = event.changedTouches[0].clientX;
      const tapY = event.changedTouches[0].clientY;
      const moved = Math.hypot(tapX - this.touchStartClientX, tapY - this.touchStartClientY);
      const now = Date.now();

      if (moved < this.DOUBLE_TAP_MAX_MOVE && now - this.lastTapTime < this.DOUBLE_TAP_DELAY) {
        // Double-tap: zoom in at the tapped point (or reset if already zoomed in)
        const container = this.hostEl.nativeElement.querySelector('.layout-container') as HTMLElement | null;
        if (container) {
          const rect = container.getBoundingClientRect();
          const focalX = tapX - rect.left;
          const focalY = tapY - rect.top;
          const currentScale = this.scale();
          // Toggle: if zoomed in beyond 1.5x fit, reset; otherwise zoom in to ~2.5x fit
          const targetScale = currentScale > this.fitScale() * 1.5
            ? this.fitScale()
            : Math.min(this.fitScale() * 2.5, MAX_SCALE);
          this.applyScale(targetScale, focalX, focalY);
        }
        this.suppressNextSeatToggle = true; // Prevent the click from toggling a seat
        this.lastTapTime = 0; // Reset to prevent triple-tap
      } else {
        this.lastTapTime = now;
      }
    }

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
    // Suppress seat toggle when a double-tap-to-zoom just occurred, so the
    // zoom gesture doesn't accidentally select/deselect the seat under it.
    if (this.suppressNextSeatToggle) {
      this.suppressNextSeatToggle = false;
      return;
    }
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