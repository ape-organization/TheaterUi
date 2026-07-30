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

    return this.http.get<SupervisorTransfer[]>(`${environment.apiUrl}/super-admin/transfers`).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }

  updateTransferStatus(id: any, status: 'CONFIRMED' ): Observable<any> {
    this.isLoading.set(true);

    return this.http.post(`${environment.apiUrl}/super-admin/transfers/${id}/confirm`, {}).pipe(
      finalize(() => this.isLoading.set(false))
    );
  }
}
