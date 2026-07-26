export interface LoginRequest {
  email?: string;
  phoneNumber?: string;
  contactMethod: 'email' | 'phone';
}

export interface OtpVerifyRequest {
  email?: string;
  phoneNumber?: string;
  contactMethod: 'email' | 'phone';
  otp: string;
}

export interface AuthResponse {
  userId: string;
  email?: string;
  phoneNumber?: string;
  contactMethod: 'email' | 'phone';
  role: 'admin' | 'user' | 'supervisor';
  token: string;
  message: string;
  name?: string;
  church?: string;
}

export interface EventResponse {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  ticketPrice: number;
  description: string;
  imageUrl: string;
}

export interface Seat {
  id: number;
  seatNumber: string;
  row: string;
  status: 'available' | 'reserved' | 'selected';
  price: number;
}

export interface SeatSection {
  name: string;
  seats: Seat[];
}

export interface SeatRow {
  name: string;
  sections?: SeatSection[];
  seats?: Seat[];
}

export interface SeatMapResponse {
  eventId: number;
  rows: SeatRow[];
}

export interface BookingDraft {
  event: EventResponse;
  selectedSeats: Seat[];
}

export interface BookingRequest {
  eventId: number;
  seatIds: number[];
  contactMethod: 'email' | 'phone';
  contactValue: string;
  name?: string;
  church?: string;
}

export interface BookingResponse {
  bookingId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  selectedSeats: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  contactMethod: 'email' | 'phone';
  contactValue: string;
  name?: string;
  church?: string;
}

export interface AllBookingResponse {
  bookingId: string;
  userId: string;
  userContact: string;
  contactMethod: 'email' | 'phone';
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  selectedSeats: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  name?: string;
  church?: string;
}

export interface UpdateBookingStatusRequest {
  bookingId: string;
  status: 'confirmed' | 'cancelled';
}

export interface TheaterSeat {
  id: number;
  seatNumber: string;
  row: string;
  status: 'available' | 'reserved' | 'selected';
  price: number;
  section: string;
  sectionIndex: number;
}
export interface SeatBlock{

    id:string;

    rows: Seat[][];

    rotation:number;

    translateX:number;

    translateY:number;

}
export interface TheaterRow {
  name: string;
  label: string;
  seats: TheaterSeat[];
  type: 'vip' | 'regular';
}

export interface TheaterSection {
  name: string;
  rows: TheaterRow[];
}

// Supervisor / Money Transfer models
export interface MoneyTransfer {
  id: string;
  amount: number;
  fromAdminId: string;
  fromAdminName: string;
  toSupervisorId: string;
  toSupervisorName: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  confirmedAt?: string;
  notes?: string;
}

export interface CreateMoneyTransferRequest {
  amount: number;
  toSupervisorId?: string;
  toSupervisorName?: string;
  notes?: string;
}

export interface UpdateMoneyTransferRequest {
  status: 'confirmed' | 'cancelled';
}

export interface SupervisorTransfer {
  id: string;
  amount: number;
  fromAdminName: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  confirmedAt?: string;
  notes?: string;
}

// User info for booking
export interface UserInfo {
  name: string;
  church: string;
}