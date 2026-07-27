import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { MoneyTransfer, CreateMoneyTransferRequest } from '../../../core/models/api.models';
import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="transfers-page">
      <div class="transfers-container">
        <div class="page-header">
          <h1>تحويل المشرف</h1>
          <p>إدارة تحويلات الأموال للمشرفين</p>
        </div>

        <!-- Create Transfer Form -->
        <div class="card create-card">
          <h2>تحويل جديد</h2>
          <form (ngSubmit)="createTransfer()" #transferForm="ngForm">
            <div class="form-row">
              <div class="form-group">
                <label>المبلغ (EGP)</label>
                <input
                  type="number"
                  class="cinema-input"
                  [(ngModel)]="newTransfer.amount"
                  name="amount"
                  required
                  min="1"
                  placeholder="أدخل المبلغ"
                />
              </div>
              <div class="form-group">
                <label>اسم المشرف</label>
                <input
                  type="text"
                  class="cinema-input"
                  [(ngModel)]="newTransfer.toSupervisorName"
                  name="supervisorName"
                  required
                  placeholder="اسم المشرف"
                />
              </div>
            </div>
            <div class="form-group">
              <label>ملاحظات</label>
              <textarea
                class="cinema-input"
                [(ngModel)]="newTransfer.notes"
                name="notes"
                rows="2"
                placeholder="ملاحظات إضافية (اختياري)"
              ></textarea>
            </div>
            <button type="submit" class="btn-primary" [disabled]="isSubmitting">
              @if (isSubmitting) {
                جاري الإرسال...
              } @else {
                تحويل
              }
            </button>
          </form>
        </div>

        <!-- Transfers List -->
        <div class="card">
          <h2>جميع التحويلات</h2>

          @if (isLoading) {
            <div class="loading-state">
              <div class="spinner"></div>
              <span>جاري التحميل...</span>
            </div>
          } @else if (transfers.length === 0) {
            <div class="empty-state">
              <p>لا توجد تحويلات بعد</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table class="transfers-table">
                <thead>
                  <tr>
                    <th>المعرف</th>
                    <th>المبلغ</th>
                    <th>المشرف</th>
                    <th>ملاحظات</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  @for (transfer of transfers; track transfer.id) {
                    <tr>
                      <td class="id-cell">{{ transfer.id }}</td>
                      <td class="amount-cell">EGP {{ transfer.amount | number }}</td>
                      <td>{{ transfer.toSupervisorName }}</td>
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
    .transfers-page {
      padding: 2rem 1rem;
      min-height: 100vh;
      background: var(--clr-bg-primary);
    }

    .transfers-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
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

    .card {
      background: var(--clr-bg-card);
      border: 1px solid rgba(107, 78, 58, 0.1);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .card h2 {
      font-size: 1.2rem;
      color: var(--clr-text-primary);
      margin-bottom: 1.25rem;
      font-weight: 600;
    }

    .create-card {
      border-right: 4px solid var(--clr-gold);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--clr-text-secondary);
      margin-bottom: 0.4rem;
    }

    textarea.cinema-input {
      resize: vertical;
    }

    .btn-primary {
      width: 100%;
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
      text-align: center;
      padding: 2rem;
      color: var(--clr-text-muted);
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

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .transfers-page {
        padding: 1rem 0.75rem;
      }

      .card {
        padding: 1rem;
      }
    }
  `]
})
export class TransfersComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  transfers: MoneyTransfer[] = [];
  isLoading = true;
  isSubmitting = false;

  newTransfer: CreateMoneyTransferRequest = {
    amount: 0,
    toSupervisorName: '',
    notes: ''
  };

  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers(): void {
    this.isLoading = true;
    this.http.get<MoneyTransfer[]>(`${environment.apiUrl}/api/v1/admin/transfers`).subscribe({
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

  createTransfer(): void {
    if (!this.newTransfer.amount || !this.newTransfer.toSupervisorName) {
      window.alert('يرجى إدخال المبلغ واسم المشرف');
      return;
    }

    this.isSubmitting = true;
    this.http.post<MoneyTransfer>(`${environment.apiUrl}/api/v1/admin/transfers`, this.newTransfer).subscribe({
      next: () => {
        this.newTransfer = { amount: 0, toSupervisorName: '', notes: '' };
        this.isSubmitting = false;
        this.loadTransfers();
      },
      error: () => {
        window.alert('فشل إنشاء التحويل');
        this.isSubmitting = false;
      }
    });
  }
}