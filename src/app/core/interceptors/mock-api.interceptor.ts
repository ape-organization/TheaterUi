import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import { AuthResponse, BookingResponse, EventResponse, SeatMapResponse, AllBookingResponse } from '../models/api.models';
import { theaterSeatLayout } from '../data/theater-layout.data';

@Injectable()
export class MockApiInterceptor implements HttpInterceptor {
  private adminEmail = 'admin@theatre.com';
  private adminPhone = '010000000';

  private bookings: AllBookingResponse[] = [
    {
      bookingId: 'BK-1001',
      userId: 'user-001',
      userContact: 'ahmed@example.com',
      contactMethod: 'email',
      eventTitle: 'Moonlight Symphony',
      eventDate: '2026-08-16',
      eventTime: '19:30',
      selectedSeats: ['A1', 'A2', 'A3'],
      totalAmount: 4500,
      status: 'confirmed',
      createdAt: '2026-07-10T14:30:00Z'
    },
    {
      bookingId: 'BK-1002',
      userId: 'user-002',
      userContact: '0101234567',
      contactMethod: 'phone',
      eventTitle: 'Moonlight Symphony',
      eventDate: '2026-08-16',
      eventTime: '19:30',
      selectedSeats: ['B4', 'B5'],
      totalAmount: 3000,
      status: 'pending',
      createdAt: '2026-07-11T10:15:00Z'
    },
    {
      bookingId: 'BK-1003',
      userId: 'user-003',
      userContact: 'sara@example.com',
      contactMethod: 'email',
      eventTitle: 'Moonlight Symphony',
      eventDate: '2026-08-16',
      eventTime: '19:30',
      selectedSeats: ['C1'],
      totalAmount: 1500,
      status: 'confirmed',
      createdAt: '2026-07-09T09:00:00Z'
    }
  ];

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('[MockApiInterceptor] Request:', req.method, req.url);

    // Login - support email or phone
    if (req.method === 'POST' && req.url === '/api/auth/login') {
      const body = req.body as { email?: string; phoneNumber?: string; contactMethod: 'email' | 'phone' };
      const isAdmin = body.email === this.adminEmail || body.phoneNumber === this.adminPhone;

      const response: AuthResponse = {
        userId: isAdmin ? 'admin-001' : 'user-001',
        email: body.email,
        phoneNumber: body.phoneNumber,
        contactMethod: body.contactMethod,
        role: isAdmin ? 'admin' : 'user',
        token: 'mock-token',
        message: 'OTP sent successfully.'
      };

      return of(new HttpResponse({ status: 200, body: response })).pipe(delay(600));
    }

    // Verify OTP
    if (req.method === 'POST' && req.url === '/api/auth/verify-otp') {
      const body = req.body as { email?: string; phoneNumber?: string; contactMethod: 'email' | 'phone' };
      const isAdmin = body.email === this.adminEmail || body.phoneNumber === this.adminPhone;

      const response: AuthResponse = {
        userId: isAdmin ? 'admin-001' : 'user-001',
        email: body.email,
        phoneNumber: body.phoneNumber,
        contactMethod: body.contactMethod,
        role: isAdmin ? 'admin' : 'user',
        token: 'mock-token',
        message: 'Authentication successful.'
      };

      return of(new HttpResponse({ status: 200, body: response })).pipe(delay(700));
    }

    // Get Event
    if (req.method === 'GET' && req.url === '/api/events/1') {
      const response: EventResponse = {
        id: 1,
        title: 'Moonlight Symphony',
        date: '2026-08-16',
        time: '19:30',
        location: 'Grand Hall, Nairobi',
        ticketPrice: 1500,
        description: 'A cinematic orchestra experience under the stars.',
        imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80'
      };

      return of(new HttpResponse({ status: 200, body: response })).pipe(delay(600));
    }

    // Get Seat Map
    if (req.method === 'GET' && req.url === '/api/events/1/seats') {
      const response: SeatMapResponse = theaterSeatLayout;

      return of(new HttpResponse({ status: 200, body: response })).pipe(delay(700));
    }

    // Create Booking
    if (req.method === 'POST' && req.url === '/api/bookings') {
      const body = req.body as { eventId: number; seatIds: number[]; contactMethod: 'email' | 'phone'; contactValue: string };

      const newBooking: AllBookingResponse = {
        bookingId: `BK-${1000 + this.bookings.length + 1}`,
        userId: 'user-001',
        userContact: body.contactValue,
        contactMethod: body.contactMethod,
        eventTitle: 'Moonlight Symphony',
        eventDate: '2026-08-16',
        eventTime: '19:30',
        selectedSeats: body.seatIds.map((id) => `Seat ${id}`),
        totalAmount: body.seatIds.length * 1500,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      this.bookings.push(newBooking);

      const response: BookingResponse = {
        bookingId: newBooking.bookingId,
        eventTitle: newBooking.eventTitle,
        eventDate: newBooking.eventDate,
        eventTime: newBooking.eventTime,
        selectedSeats: newBooking.selectedSeats,
        totalAmount: newBooking.totalAmount,
        status: 'pending',
        contactMethod: body.contactMethod,
        contactValue: body.contactValue
      };

      return of(new HttpResponse({ status: 200, body: response })).pipe(delay(700));
    }

    // Get All Bookings (Admin)
    if (req.method === 'GET' && req.url === '/api/admin/bookings') {
      return of(new HttpResponse({ status: 200, body: [...this.bookings] })).pipe(delay(600));
    }

    // Update Booking Status (Admin)
    if (req.method === 'PUT' && req.url.startsWith('/api/admin/bookings/')) {
      const bookingId = req.url.split('/').pop() ?? '';
      const body = req.body as { status: 'confirmed' | 'cancelled' };

      const booking = this.bookings.find((b) => b.bookingId === bookingId);
      if (booking) {
        booking.status = body.status;
      }

      return of(new HttpResponse({ status: 200, body: { success: true, bookingId, status: body.status } })).pipe(delay(500));
    }

    return next.handle(req);
  }
}