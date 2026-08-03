import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { UserInfo } from '../../../shared/components/user-info/user-info';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly activeTab = signal<'email' | 'phone'>('phone');

  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  readonly phoneForm = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
  });

  //readonly isLoading = this.authService.isLoading;
  readonly isLoading = signal(false);
  readonly error = signal(false);
  readonly errorMsg = signal('');


  submit(): void {
    this.isLoading.set(true);
    this.error.set(false);

      if (this.phoneForm.invalid) {
                    this.isLoading.set(false);

        this.phoneForm.markAllAsTouched();
        return;
      }
      const phone = this.phoneForm.value.phoneNumber ?? '';
      this.authService.login('phone', phone).subscribe({
        next: (res:any) => {
          this.router.navigate(['/auth/verify'], { queryParams: { method: 'phone', contact: phone } });
        },
        error: (res:any) => {
            this.isLoading.set(false);

          this.error.set(true);

          if (res.message?.includes("https"))
                    this.errorMsg.set('تعذر تسجيل البيانات. حاول مرة أخرى.');
          else
        this.errorMsg.set(res.message || 'تعذر تسجيل البيانات. حاول مرة أخرى.');
         // window.alert('تعذر إرسال رمز التحقق. حاول مرة أخرى.');
        }
      });

  }
}
