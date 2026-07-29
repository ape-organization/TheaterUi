import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { UserInfo } from '../../../shared/components/user-info/user-info';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';
import { BookingService } from '../../../core/services/booking.service';
import { BookingResponse } from '../../../core/models/api.models';

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
  private readonly userService = inject(UserService);
  private readonly bookingService = inject(BookingService);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  bookingConfirmed = output<string[]>();

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
          console.log(response.user.role === 'USER')
              if (response.user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (response.user.role === 'USER') {
       this. getUserReserivation()

        } else {
                    this.router.navigate(['/supervisor']);

        }
        }
      },
      error: (res:any) => {
        this.error.set(true);
         if (res.message?.includes("https"))
                    this.errorMsg.set(' حاول مرة أخرى.');
          else
        this.errorMsg.set(res.message || 'تعذر التحقق من رمز التحقق. حاول مرة أخرى.');
      }
    });
  }
  getUserReserivation()
  {
 this.userService.GetUserReservation().subscribe({
        next: (res:any) => {
          console.log(res)
          console.log(res.length)

           if(res.length==1)
          {
            console.log("here ")
                this.bookingService.clearSelection();
                //case res into BookingResponse to sent to ticket
/* const bookings: BookingResponse[] = res.map((booking: any) => ({
  bookingId: booking.id,

  selectedSeats: booking.seats.map((seat: any) => {
  const [section, seatNumber] = seat.label.split('-');

  const sectionName = section === 'STAGE'
    ? 'صالة'
    : section === 'BAL'
      ? 'بلكونة'
      : section;

  return `${sectionName} (${seatNumber})`;
}),
  totalAmount: booking.totalAmount ?? 0,
  status: booking.status.toLowerCase() as 'pending' | 'confirmed' | 'cancelled',

  name: booking.user.name,

})); */
        // Store the booking response so the ticket page can display it
        this.bookingService.setBookingResponse(res[0]);

          this.router.navigate(['/ticket'] );

          }
          else if (res.length > 1)
           {
                       this.bookingService.setBookings(res);
                       this.router.navigate(['/my-reservations']);

           }
else{
  this.router.navigate(['/event']);

  //do something here
}
        },
      error:(res)=>{
 this.error.set(true);

          if (res.message?.includes("https"))
                    this.errorMsg.set('تعذر تسجيل البيانات. حاول مرة أخرى.');
          else
        this.errorMsg.set(res.message || 'تعذر تسجيل البيانات. حاول مرة أخرى.');


      }
      })
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
response.user.name = result.userName;

  this.authService.setAuthenticatedUser(response);

         if (response.user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (response.user.role === 'USER') {
            //   this.router.navigate(['/event']);
        this.    getUserReserivation()

        } else {

                    this.router.navigate(['/supervisor']);

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
