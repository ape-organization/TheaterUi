
export interface LoginRequest {
  email?: string;
  phoneNumber?: string;
  contactMethod: 'email' | 'phone';
}
export interface AuthRequest {
  phone?: string;
}
export interface AuthOtpVerifyRequest {
  
  phone?: string;
  otp: string;
}
export interface User {
  id: number;
  name: string;
  phone: string;
  firstLogin: boolean;
  role:string;
}
export interface AuthResponse {
 
  "token": "string",
  "firstLogin": true,
  "user": User,

  
}

export interface Seat
{
  
      "id": string,
      "label": string,
      "status": string,
      "price":number
    
}
export interface SeatReceive
{
  
      "id": number,
      "label": string,
      "status": string,
      "price":number
    
}
export interface Reserivation
{
    "id": number,
    "status": string,
    "expiresAt":string,
    "createdAt":string,
    "seats": SeatReceive[],
    "user": User
  }



export interface SeatBlock{

    id:string;

    rows: Seat[][];

    rotation:number;

    translateX:number;

    translateY:number;

}
export interface 	ReceriveSeatRequest
{
  "seatLabels":string[]
}
export interface 	ReceriveSeat
{
  
  "id": number,
  "status": string,
  "expiresAt": string,
  "createdAt": string,
  "seats": Seat[],
  "user":UserInfo

}
export interface SeatRecerived
{
  "id": number,
    "label": string,
    "status": string
}
////////////////////
export interface OtpVerifyRequest {
  email?: string;
  phoneNumber?: string;
  contactMethod: 'email' | 'phone';
  otp: string;
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

/* export interface Seat {
  id: number;
  seatNumber: string;
  row: string;
  status: 'available' | 'reserved' | 'selected';
  price: number;
} */

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
  bookingId: number;
 
  selectedSeats: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';

  name?: string;
  
}

export interface AllBookingResponse {
 
    "id": number,
    "status": string,
    "expiresAt": string,
    "createdAt": string,
    "totalAmount": number| null,
    "seats": SeatReceive[],
    "user": User
  
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
export interface Balance {
balance:number;
}

export interface CreateMoneyTransferRequest {
  amount: number;

}

export interface UpdateMoneyTransferRequest {
  status: 'confirmed' | 'cancelled';
}

export interface SupervisorTransfer {
  id: string;
  amount: number;
  fromAdminName: string;
  status: 'PENDING' | 'CONFIRMED' ;
  createdAt: string;
  confirmedAt?: string;
  notes?: string;
}

// User info for booking
export interface UserInfo {
  name: string;
  church: string;
}

// Booking status type
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

// User's booking (reservation) with optional event info
export interface UserBooking {
  id: number;
  status: string;
  expiresAt: string;
  createdAt: string;
  seats: Seat[];
  user: UserInfo;
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
}
