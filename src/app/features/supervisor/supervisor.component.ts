import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SupervisorTransfer } from '../../core/models/api.models';

@Component({
  selector: 'app-supervisor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="supervisor-page">
      <div class="supervisor-container">
        <div class="page-header">
          <div class="header-content">
            <div>
              <h1>لوحة المشرف</h1>
              <p>مرحباً {{ currentUser?.name || currentUser?.email || currentUser?.phoneNumber }}</p>
            </div>
            <button class="btn-logout" (click)="logout()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              خروج
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon pending-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">قيد الانتظار</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon confirmed-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ confirmedCount }}</span>
              <span class="stat-label">تم الاستلام</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon total-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">EGP {{ totalAmount | number }}</span>
              <span class="stat-label">إجمالي المستلم</span>
            </div>
          </div>
        </div>

        <!-- Transfers List -->
        <div class="card">
          <h2>التحويلات الواردة</h2>

          @if (isLoading) {
            <div class="loading-state">
              <div class="spinner"></div>
              <span>جاري التحميل...</span>
            </div>
          } @else if (transfers.length === 0) {
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
              <h3>لا توجد تحويلات</h3>
              <p>لم يتم إرسال أي تحويلات إليك بعد</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table class="transfers-table">
                <thead>
                  <tr>
                    <th>المعرف</th>
                    <th>من</th>
                    <th>المبلغ</th>
                    <th>ملاحظات</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  @for (transfer of transfers; track transfer.id) {
                    <tr>
                      <td class="id-cell">{{ transfer.id }}</td>
                      <td>{{ transfer.fromAdminName }}</td>
                      <td class="amount-cell">EGP {{ transfer.amount | number }}</td>
                      <td>{{ transfer.notes || '—' }}</td>
                      <td class="date-cell">{{ transfer.createdAt | date:'medium' }}</td>
                      <td>
                        <span class="status-badge" [class.pending]="transfer.status === 'pending'"
                              [class.confirmed]="transfer.status === 'confirmed'"
                              [class.cancelled]="transfer.status === 'cancelled'">
                          @if (transfer.status === 'pending') { قيد الانتظار }
                          @else if (transfer.status === 'confirmed') { تم الاستلام }
                          @else { ملغي }
                        </span>
                      </td>
                      <td>
                        @if (transfer.status === 'pending') {
                          <div class="action-buttons">
                            <button class="btn-confirm" (click)="confirmTransfer(transfer.id)" [disabled]="updatingId === transfer.id">
                              @if (updatingId === transfer.id) {
                                <div class="btn-spinner"></div>
                              } @else {
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              }
                              تأكيد الاستلام
                            </button>
                            <button class="btn-cancel" (click)="cancelTransfer(transfer.id)" [disabled]="updatingId === transfer.id">
                              @if (updatingId === transfer.id) {
                                <div class="btn-spinner"></div>
                              } @else {
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"/>
                                  <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              }
                              رفض
                            </button>
                          </div>
                        } @else {
                          <span class="no-action">—</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .supervisor-page {
      padding: 2rem 1rem;
      min-height: 100vh;
      background: var(--clr-bg-primary);
    }

    .supervisor-container {
      max-width: 1100px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .page-header h1 {
      font-size: 1.8rem;
      color: var(--clr-brown);
      font-weight: 700;
    }

    .page-header p {
      color: var(--clr-text-muted);
      margin-top: 0.3rem;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border: 1px solid rgba(107, 78, 58, 0.15);
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--clr-text-secondary);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all var(--transition);
      font-family: var(--font-primary);
    }

    .btn-logout:hover {
      background: rgba(179, 58, 58, 0.08);
      border-color: var(--clr-error);
      color: var(--clr-error);
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: var(--clr-bg-card);
      border: 1px solid rgba(107, 78, 58, 0.08);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .pending-icon {
      background: var(--clr-gold-subtle);
      color: var(--clr-gold);
    }

    .confirmed-icon {
      background: rgba(45, 122, 74, 0.1);
      color: var(--clr-success);
    }

    .total-icon {
      background: rgba(107, 78, 58, 0.1);
      color: var(--clr-brown);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--clr-text-primary);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--clr-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .card {
      background: var(--clr-bg-card);
      border: 1px solid rgba(107, 78, 58, 0.08);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .card h2 {
      font-size: 1.2rem;
      color: var(--clr-text-primary);
      margin-bottom: 1.25rem;
      font-weight: 600;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      color: var(--clr-text-muted);
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(107, 78, 58, 0.1);
      border-top-color: var(--clr-gold);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      color: var(--clr-text-muted);
      text-align: center;
    }

    .empty-state h3 {
      color: var(--clr-text-primary);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .transfers-table {
      width: 100%;
      border-collapse: collapse;
    }

    .transfers-table th {
      text-align: right;
      padding: 0.75rem 1rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--clr-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      border-bottom: 1px solid rgba(107, 78, 58, 0.08);
      white-space: nowrap;
    }

    .transfers-table td {
      padding: 0.75rem 1rem;
      font-size: 0.88rem;
      color: var(--clr-text-primary);
      border-bottom: 1px solid rgba(107, 78, 58, 0.04);
    }

    .transfers-table tbody tr:hover {
      background: var(--clr-bg-hover);
    }

    .id-cell {
      font-family: monospace;
      font-weight: 600;
      color: var(--clr-accent);
      font-size: 0.8rem;
    }

    .amount-cell {
      font-weight: 700;
      color: var(--clr-brown);
    }

    .date-cell {
      font-size: 0.8rem;
      color: var(--clr-text-muted);
      white-space: nowrap;
    }

    .status-badge {
      display: inline-flex;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .status-badge.pending {
      background: var(--clr-gold-subtle);
      color: var(--clr-gold);
    }

    .status-badge.confirmed {
      background: rgba(45, 122, 74, 0.1);
      color: var(--clr-success);
    }

    .status-badge.cancelled {
      background: rgba(179, 58, 58, 0.1);
      color: var(--clr-error);
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-confirm, .btn-cancel {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      font-family: var(--font-primary);
    }

    .btn-confirm {
      background: rgba(45, 122, 74, 0.1);
      color: var(--clr-success);
      border-color: rgba(45, 122, 74, 0.2);
    }

    .btn-confirm:hover:not(:disabled) {
      background: rgba(45, 122, 74, 0.2);
    }

    .btn-cancel {
      background: rgba(179, 58, 58, 0.1);
      color: var(--clr-error);
      border-color: rgba(179, 58, 58, 0.2);
    }

    .btn-cancel:hover:not(:disabled) {
      background: rgba(179, 58, 58, 0.2);
    }

    .btn-confirm:disabled, .btn-cancel:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .no-action {
      color: var(--clr-text-muted);
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: 1fr;
      }

      .supervisor-page {
        padding: 1rem 0.75rem;
      }

      .card {
        padding: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class SupervisorComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  transfers: SupervisorTransfer[] = [];
  isLoading = true;
  updatingId: string | null = null;

  get currentUser() {
    return this.authService.currentUser();
  }

  get pendingCount(): number {
    return this.transfers.filter(t => t.status === 'pending').length;
  }

  get confirmedCount(): number {
    return this.transfers.filter(t => t.status === 'confirmed').length;
  }

  get totalAmount(): number {
    return this.transfers
      .filter(t => t.status === 'confirmed')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers(): void {
    this.isLoading = true;
    this.http.get<SupervisorTransfer[]>('/api/supervisor/transfers').subscribe({
      next: (data) => {
        this.transfers = data;
        this.isLoading = false;
      },
      error: () => {
        window.alert('فشل تحميل التحويلات');
        this.isLoading = false;
      }
    });
  }

  confirmTransfer(id: string): void {
    this.updatingId = id;
    this.http.put(`/api/supervisor/transfers/${id}`, { status: 'confirmed' }).subscribe({
      next: () => {
        const transfer = this.transfers.find(t => t.id === id);
        if (transfer) transfer.status = 'confirmed';
        this.updatingId = null;
      },
      error: () => {
        window.alert('فشل تأكيد الاستلام');
        this.updatingId = null;
      }
    });
  }

  cancelTransfer(id: string): void {
    this.updatingId = id;
    this.http.put(`/api/supervisor/transfers/${id}`, { status: 'cancelled' }).subscribe({
      next: () => {
        const transfer = this.transfers.find(t => t.id === id);
        if (transfer) transfer.status = 'cancelled';
        this.updatingId = null;
      },
      error: () => {
        window.alert('فشل إلغاء التحويل');
        this.updatingId = null;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}