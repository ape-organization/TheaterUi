import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss'
})
export class VerifyOtpComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  readonly isLoading = this.authService.isLoading;

  protected readonly method = this.route.snapshot.queryParams['method'] ?? 'phone';
  protected readonly contact = this.route.snapshot.queryParams['contact'] ?? '';

  get contactDisplay(): string {
    return this.contact;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const otp = this.form.value.otp ?? '';

    this.authService.verifyOtp(this.method, this.contact, otp).subscribe({
      next: (response) => {
        this.authService.setAuthenticatedUser(response);
        if (response.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (response.role === 'supervisor') {
          this.router.navigate(['/supervisor']);
        } else {
          this.router.navigate(['/event']);
        }
      },
      error: () => {
        window.alert('رمز التحقق غير صحيح. حاول مرة أخرى.');
      }
    });
  }
}