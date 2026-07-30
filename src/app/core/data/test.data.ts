export type SeatStatus =
  | 'available'
  | 'reserved'
  | 'selected'
  | 'vip'
  | 'pending'
  | 'confirmed';

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
  label: string;
}

export interface Theater {
  stageTitle: string;
  blocks: SeatBlock[];
}