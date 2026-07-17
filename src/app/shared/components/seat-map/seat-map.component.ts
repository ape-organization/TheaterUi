import { Component, computed, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import type { Seat, SeatRow, SeatSection, TheaterRow, TheaterSeat, TheaterSection } from '../../../core/models/api.models';


@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './seat-map.component.html',
  styleUrls: ['./seat-map.component.scss']
})
export class SeatMapComponent implements OnInit, OnChanges {
  ///
@Input() seat!: TheaterSeat;
@Output() select = new EventEmitter<TheaterSeat>();
  ///
  @Input() rows: SeatRow[] = [];
  @Input() selectedSeats: Seat[] = [];
  @Output() seatSelectionChange = new EventEmitter<Seat[]>();

  protected readonly selectedSeatIds = signal<number[]>([]);
  protected readonly theaterSections = signal<TheaterSection[]>([]);

  readonly selectedSeatCount = computed(() => this.selectedSeatIds().length);
  readonly selectedSeatTotal = computed(() => {
    return this.selectedSeatIds().reduce((total, seatId) => {
      const seat = this.getAllSeats().find((item) => item.id === seatId);
      return total + (seat?.price ?? 0);
    }, 0);
  });

  ngOnInit(): void {
    this.theaterSections.set(this.buildTheaterLayout());
    this.selectedSeatIds.set(this.selectedSeats.map((seat) => seat.id));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedSeats'] && !changes['selectedSeats'].firstChange) {
      this.selectedSeatIds.set(this.selectedSeats.map((seat) => seat.id));
    }
  }

  private buildTheaterLayout(): TheaterSection[] {
    let seatIdCounter = 1;
    const vipPrice = 2500;
    const regularPrice = 1500;

    // Create a lookup map from API: seatNumber -> status
    const apiSeatStatus = new Map<string, 'available' | 'reserved'>();
    for (const row of this.rows) {
      for (const section of row.sections ?? []) {
        for (const seat of section.seats ?? []) {
          const mappedStatus: 'available' | 'reserved' = seat.status === 'selected' ? 'available' : seat.status;
          apiSeatStatus.set(seat.seatNumber, mappedStatus);
        }
      }
    }

    const buildSeat = (row: string, seatNum: number, price: number): TheaterSeat => {
      const seatNumber = `${row}${seatNum}`;
      const apiStatus = apiSeatStatus.get(seatNumber);
      return {
        id: seatIdCounter++,
        seatNumber,
        row,
        status: apiStatus ?? 'available',
        price,
        section: '',
        sectionIndex: 0,
      };
    };

    /** Build VIP row: 3 sections — Left (even 10,8,12..34), Center (5,7,3,1,2,4,6), Right (odd 33,35,31..9) */
    const buildVipRow = (r: string): TheaterRow => {
      const leftNums = [10, 8, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34];
      const centerNums = [5, 7, 3, 1, 2, 4, 6];
      const rightNums = [33, 35, 31, 29, 27, 25, 23, 21, 19, 17, 15, 13, 11, 9];

      const leftSeats = leftNums.map(n => buildSeat(r, n, vipPrice));
      const centerSeats = centerNums.map(n => buildSeat(r, n, vipPrice));
      const rightSeats = rightNums.map(n => buildSeat(r, n, vipPrice));

      return {
        name: r,
        label: r,
        type: 'vip',
        seats: [...leftSeats, ...centerSeats, ...rightSeats],
      };
    };

    /** Build Regular row: 2 sections — Left (even 4,2,6,8..leftMax), Right (odd rightMax, rightMax-2..1) */
    const buildRegularRow = (r: string, leftMax: number, rightMax: number): TheaterRow => {
      const leftNums = [4, 2];
      for (let n = 6; n <= leftMax; n += 2) {
        leftNums.push(n);
      }
      const leftSeats = leftNums.map(n => buildSeat(r, n, regularPrice));

      const rightNums: number[] = [];
      const startOdd = rightMax % 2 === 0 ? rightMax - 1 : rightMax;
      const secondOdd = startOdd - 2;
      rightNums.push(startOdd, secondOdd);
      for (let n = secondOdd - 2; n >= 1; n -= 2) {
        rightNums.push(n);
      }
      const rightSeats = rightNums.map(n => buildSeat(r, n, regularPrice));

      return {
        name: r,
        label: r,
        type: 'regular',
        seats: [...leftSeats, ...rightSeats],
      };
    };

    // ====== SECTION 1: Rows A-R ======
    const section1Rows: TheaterRow[] = [];

    // VIP rows A, B, C
    for (const r of ['A', 'B', 'C']) {
      section1Rows.push(buildVipRow(r));
    }

    // Regular rows D-R (18 rows total: A,B,C + D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R = 18)
    const regularDefs: { name: string; leftMax: number; rightMax: number }[] = [
      { name: 'D', leftMax: 30, rightMax: 29 },
      { name: 'E', leftMax: 30, rightMax: 29 },
      { name: 'F', leftMax: 30, rightMax: 29 },
      { name: 'G', leftMax: 32, rightMax: 31 },
      { name: 'H', leftMax: 32, rightMax: 31 },
      { name: 'I', leftMax: 32, rightMax: 31 },
      { name: 'J', leftMax: 32, rightMax: 31 },
      { name: 'K', leftMax: 34, rightMax: 33 },
      { name: 'L', leftMax: 34, rightMax: 33 },
      { name: 'M', leftMax: 34, rightMax: 33 },
      { name: 'N', leftMax: 34, rightMax: 33 },
      { name: 'O', leftMax: 36, rightMax: 35 },
      { name: 'P', leftMax: 36, rightMax: 35 },
      { name: 'Q', leftMax: 36, rightMax: 35 },
      { name: 'R', leftMax: 36, rightMax: 35 },
    ];

    for (const def of regularDefs) {
      section1Rows.push(buildRegularRow(def.name, def.leftMax, def.rightMax));
    }

    // ====== SECTION 2: Rows A-H (repeat) ======
    const section2Rows: TheaterRow[] = [];

    for (const r of ['A', 'B', 'C']) {
      section2Rows.push(buildVipRow(r));
    }

    const regularDefs2: { name: string; leftMax: number; rightMax: number }[] = [
      { name: 'D', leftMax: 30, rightMax: 29 },
      { name: 'E', leftMax: 30, rightMax: 29 },
      { name: 'F', leftMax: 30, rightMax: 29 },
      { name: 'G', leftMax: 32, rightMax: 31 },
      { name: 'H', leftMax: 32, rightMax: 31 },
    ];

    for (const def of regularDefs2) {
      section2Rows.push(buildRegularRow(def.name, def.leftMax, def.rightMax));
    }

    return [
      { name: 'Upper Level', rows: section1Rows },
      { name: 'Lower Level', rows: section2Rows },
    ];
  }

  getAllSeats(): Seat[] {
    return this.theaterSections().flatMap((section) =>
      section.rows.flatMap((row) =>
        row.seats.map((s) => ({
          id: s.id,
          seatNumber: s.seatNumber,
          row: s.row,
          status: s.status,
          price: s.price,
        }))
      )
    );
  }

  toggleSeatSelection(seat: TheaterSeat): void {
    if (seat.status === 'reserved') {
      return;
    }

    const current = this.selectedSeatIds();
    const next = current.includes(seat.id)
      ? current.filter((seatId) => seatId !== seat.id)
      : [...current, seat.id];

    this.selectedSeatIds.set(next);
    const selected = this.getAllSeats().filter((item) => next.includes(item.id));
    this.seatSelectionChange.emit(selected);
  }

  isSelected(seatId: number): boolean {
    return this.selectedSeatIds().includes(seatId);
  }

  isReserved(seat: TheaterSeat): boolean {
    return seat.status === 'reserved';
  }

  /** Get row style separator CSS class */
  getRowStyle(row: TheaterRow, index: number): string {
    if (row.type === 'vip') return 'vip-row';
    return 'regular-row';
  }
}