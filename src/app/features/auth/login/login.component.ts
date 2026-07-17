import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly activeTab = signal<'email' | 'phone'>('email');

  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  readonly phoneForm = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]]
  });

  readonly isLoading = this.authService.isLoading;

  switchTab(tab: 'email' | 'phone'): void {
    this.activeTab.set(tab);
  }

  submit(): void {
    if (this.activeTab() === 'email') {
      if (this.emailForm.invalid) {
        this.emailForm.markAllAsTouched();
        return;
      }
      const email = this.emailForm.value.email ?? '';
      this.authService.login('email', email).subscribe({
        next: () => {
          this.router.navigate(['/auth/verify'], { queryParams: { method: 'email', contact: email } });
        },
        error: () => {
          window.alert('Unable to send OTP right now. Please try again.');
        }
      });
    } else {
      if (this.phoneForm.invalid) {
        this.phoneForm.markAllAsTouched();
        return;
      }
      const phone = this.phoneForm.value.phoneNumber ?? '';
      this.authService.login('phone', phone).subscribe({
        next: () => {
          this.router.navigate(['/auth/verify'], { queryParams: { method: 'phone', contact: phone } });
        },
        error: () => {
          window.alert('Unable to send OTP right now. Please try again.');
        }
      });
    }
  }
}