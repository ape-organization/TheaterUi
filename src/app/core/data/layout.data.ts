export type SeatStatus =
  | 'available'
  | 'reserved'
  | 'selected'
  | 'vip';

export interface Seat {

  id: string;

  row: string;

  number: number;

  status: SeatStatus;

  price: number;

}
export interface SeatRow {

  label: string;

  seats: Seat[];

}
export interface SeatBlock {

  id: string;

  x: number;

  y: number;

  rotation: number;

  rows: SeatRow[];

}
export interface TheaterLayoutRow {

  row: string;

  seats: number[];

}

export interface TheaterLayoutBlock {

  id: string;

  x: number;

  y: number;

  rotation: number;

  rows: TheaterLayoutRow[];

}