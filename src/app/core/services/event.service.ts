import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { EventResponse, SeatMapResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class EventService {
  readonly selectedEvent = signal<EventResponse | null>(null);
  readonly seatMap = signal<SeatMapResponse | null>(null);
  readonly isLoading = signal(false);

  constructor(private readonly http: HttpClient) {}

  getEvent(eventId: number): Observable<EventResponse> {
    this.isLoading.set(true);

    return this.http.get<EventResponse>(`/api/events/${eventId}`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  getSeatMap(eventId: number): Observable<SeatMapResponse> {
    this.isLoading.set(true);

    return this.http.get<SeatMapResponse>(`/api/events/${eventId}/seats`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  setSelectedEvent(event: EventResponse): void {
    this.selectedEvent.set(event);
  }

  setSeatMap(seatMap: SeatMapResponse): void {
    this.seatMap.set(seatMap);
  }
}
