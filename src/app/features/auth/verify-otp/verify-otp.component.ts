import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { UserInfo } from '../../../shared/components/user-info/user-info';
import { MatDialog } from '@angular/material/dialog';

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
  readonly error = signal(false);
  readonly errorMsg = signal('');

  protected readonly method = this.route.snapshot.queryParams['method'] ?? 'phone';
  protected readonly contact = this.route.snapshot.queryParams['contact'] ?? '';
private readonly dialog = inject(MatDialog);

  get contactDisplay(): string {
    return this.contact;
  }

  submit(): void {
    this.error.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const otp = this.form.value.otp ?? '';

    this.authService.verifyOtp(this.method, this.contact, otp).subscribe({
      next: async (response) => {
        this.authService.setAuthenticatedUser(response);
        console.log(response)
        if(response.firstLogin)
        {
           this.getUserInfo(response);

        }
        else
        {
              if (response.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (response.role === 'supervisor') {
          this.router.navigate(['/supervisor']);
        } else { 
             this.router.navigate(['/event']);
        }
        }
      },
      error: (res:any) => {
        this.error.set(true);
        this.errorMsg.set(res.message || 'تعذر التحقق من رمز التحقق. حاول مرة أخرى.');
      }
    });
  }
  getUserInfo(response:any):any {
    const dialogRef = this.dialog.open(UserInfo, {
      width: '400px',
      data: {}
    }).afterClosed().subscribe((result:any) => {
      if (result) {
        if(result.userName && result.userName.trim() !== '') {
   this.authService.saveUserName(result.userName).subscribe({
        next: (res:any) => {
        if(res.name && res.name !== ''){
response.user.name =result. userName;
  this.authService.setAuthenticatedUser(response);

         if (response.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (response.role === 'supervisor') {
          this.router.navigate(['/supervisor']);
        } else { 
               this.router.navigate(['/event']);

        }
        }

        },
      error: (res:any) => {
        console.log(res)
          this.error.set(true);
        
          if (res.message?.includes("https"))
                    this.errorMsg.set('تعذر تسجيل البيانات. حاول مرة أخرى.');
else
        this.errorMsg.set(res.message || 'تعذر تسجيل البيانات. حاول مرة أخرى.');
      }})
  

        }
        // Handle the result from the dialog if needed
      }
      return null;
    });
  }
}