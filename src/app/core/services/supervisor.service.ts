import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { SupervisorTransfer } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupervisorService {
  readonly isLoading = signal(false);

  constructor(private readonly http: HttpClient) {}

  getTransfers(): Observable<SupervisorTransfer[]> {
    this.isLoading.set(true);

    return this.http.get<SupervisorTransfer[]>(`${environment.apiUrl}/api/v1/supervisor/transfers`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  updateTransferStatus(id: string, status: 'confirmed' | 'cancelled'): Observable<any> {
    this.isLoading.set(true);

    return this.http.put(`${environment.apiUrl}/api/v1/supervisor/transfers/${id}`, { status }).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }
}
