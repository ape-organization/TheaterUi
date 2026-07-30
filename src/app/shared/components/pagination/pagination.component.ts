import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  /** Total number of items across all pages */
  @Input({ required: true }) set totalItems(value: number) {
    this._totalItems.set(value);
  }
  get totalItems(): number {
    return this._totalItems();
  }
  private _totalItems = signal(0);

  /** Number of items shown per page */
  @Input() pageSize = 10;

  /** Current page (1-based) */
  @Input() set currentPage(value: number) {
    this._currentPage.set(value);
  }
  get currentPage(): number {
    return this._currentPage();
  }
  private _currentPage = signal(1);

  /** Emitted when the user navigates to a different page */
  @Output() pageChange = new EventEmitter<number>();

  /** Total number of pages */
  protected totalPages = computed(() => {
    if (this._totalItems() <= 0 || this.pageSize <= 0) return 1;
    return Math.ceil(this._totalItems() / this.pageSize);
  });

  /** Whether there is a previous page */
  protected hasPrev = computed(() => this._currentPage() > 1);

  /** Whether there is a next page */
  protected hasNext = computed(() => this._currentPage() < this.totalPages());

  /**
   * Build a compact list of page numbers to display.
   * Always shows the first and last page, the current page and its neighbors,
   * using ellipses (...) for gaps.
   */
  protected pages = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    const current = this._currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const result: (number | '...')[] = [1];

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) {
      result.push('...');
    }

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    if (end < total - 1) {
      result.push('...');
    }

    result.push(total);
    return result;
  });

  /** Index of the first item shown on the current page (1-based) */
  protected startItem = computed(() => {
    if (this._totalItems() === 0) return 0;
    return (this._currentPage() - 1) * this.pageSize + 1;
  });

  /** Index of the last item shown on the current page (1-based) */
  protected endItem = computed(() => {
    return Math.min(this._currentPage() * this.pageSize, this._totalItems());
  });

  goTo(page: number | '...'): void {
    if (page === '...') return;
    const total = this.totalPages();
    const clamped = Math.max(1, Math.min(page, total));
    if (clamped !== this._currentPage()) {
      this._currentPage.set(clamped);
      this.pageChange.emit(clamped);
    }
  }

  goPrev(): void {
    if (this.hasPrev()) {
      this.goTo(this._currentPage() - 1);
    }
  }

  goNext(): void {
    if (this.hasNext()) {
      this.goTo(this._currentPage() + 1);
    }
  }
}