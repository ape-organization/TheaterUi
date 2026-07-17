import { describe, expect, it } from 'vitest';
import { SeatMapComponent } from './seat-map.component';

function createTheaterSeat(overrides: Partial<any> = {}) {
  return {
    id: 1,
    seatNumber: 'A1',
    row: 'A',
    status: 'available' as const,
    price: 2500,
    section: 'Center',
    sectionIndex: 1,
    ...overrides,
  };
}

describe('SeatMapComponent', () => {
  it('toggles selection for an available seat', () => {
    const component = new SeatMapComponent() as any;
    const seat = createTheaterSeat({ id: 1, seatNumber: 'A1', row: 'A', status: 'available', price: 2500 });

    component.toggleSeatSelection(seat);
    expect(component.selectedSeatIds()).toEqual([1]);

    component.toggleSeatSelection(seat);
    expect(component.selectedSeatIds()).toEqual([]);
  });

  it('builds the theater layout from the PDF with 8 rows (A-H)', () => {
    const component = new SeatMapComponent() as any;
    const rows = component.theaterRows;
    expect(rows.length).toBe(8);
    expect(rows[0].name).toBe('A');
    expect(rows[7].name).toBe('H');
  });

  it('VIP rows (A-C) have 3 sections: Left, Center, Right', () => {
    const component = new SeatMapComponent() as any;
    const rows = component.theaterRows;
    for (let i = 0; i < 3; i++) {
      const row = rows[i];
      expect(row.type).toBe('vip');
      expect(row.sections.length).toBe(3);
      expect(row.sections[0].name).toBe('Left');
      expect(row.sections[1].name).toBe('Center');
      expect(row.sections[2].name).toBe('Right');
    }
  });

  it('Regular rows (D-H) have 2 sections: Left, Right', () => {
    const component = new SeatMapComponent() as any;
    const rows = component.theaterRows;
    for (let i = 3; i < 8; i++) {
      const row = rows[i];
      expect(row.type).toBe('regular');
      expect(row.sections.length).toBe(2);
      expect(row.sections[0].name).toBe('Left');
      expect(row.sections[1].name).toBe('Right');
    }
  });

  it('collects all seats from the theater layout', () => {
    const component = new SeatMapComponent() as any;
    const allSeats = component.getAllSeats();
    expect(allSeats.length).toBeGreaterThan(100);
  });

  it('does not toggle selection for a reserved seat', () => {
    const component = new SeatMapComponent() as any;
    const seat = createTheaterSeat({ id: 5, status: 'reserved' });

    component.toggleSeatSelection(seat);
    expect(component.selectedSeatIds()).toEqual([]);
  });

  it('isSelected returns true for selected seats', () => {
    const component = new SeatMapComponent() as any;
    const seat = createTheaterSeat({ id: 10 });

    component.toggleSeatSelection(seat);
    expect(component.isSelected(10)).toBe(true);
    expect(component.isSelected(99)).toBe(false);
  });

  it('isReserved returns true for reserved seats', () => {
    const component = new SeatMapComponent() as any;
    const seat = createTheaterSeat({ status: 'reserved' });

    expect(component.isReserved(seat)).toBe(true);
  });

  it('isReserved returns false for available seats', () => {
    const component = new SeatMapComponent() as any;
    const seat = createTheaterSeat({ status: 'available' });

    expect(component.isReserved(seat)).toBe(false);
  });
});