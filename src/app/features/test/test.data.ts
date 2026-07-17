export type SeatStatus =
  | 'available'
  | 'reserved'
  | 'selected'
  | 'vip';

export interface Seat {
  id: number;
  seatnumber: string;
  status: SeatStatus;
  price?: number;
}

export interface SeatRow {
  id: number;
  label: string;
  seats: Seat[];
}

export interface SeatBlock {
  id: number;
  rows: SeatRow[];
  translateX: number;
  translateY: number;
  rotation: number;
}

export interface Theater {
  stageTitle: string;
  blocks: SeatBlock[];
}