export type SeatStatus =
  | 'available'
  | 'reserved'
  | 'selected'
  | 'vip';

export interface Seat {
  id: string;
  seatnumber: string;
  status: SeatStatus;
  price?: number;
}

export interface SeatRow {
  id: string;
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