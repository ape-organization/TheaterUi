import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule,FormsModule],
  templateUrl: './user-info.html',
  styleUrl: './user-info.scss',
})
export class UserInfo {
   private readonly dialogRef = inject(MatDialogRef<UserInfo>);
  /** User info */
  protected userName = '';
  error = false;
  errorMsg = '';
   /** Save user info and close the modal */
  saveUserInfo(): void {
    this.error = false;
    if (!this.userName.trim()  ) {
    
      this.error = true;
      this.errorMsg = 'يرجى إدخال الاسم ثلاثي  للمتابعة';
      return;
    }
      if( this.userName.split(/\s+/).length!==3)
        {
            this.error = true;
      this.errorMsg = 'يرجى إدخال الاسم ثلاثي  للمتابعة';
      return;
        }
this.dialogRef.close({ userName: this.userName });
  }
  
}
