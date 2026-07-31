import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  //readonly isAuthenticated = this.authService.isLoggedIn;
//name = localStorage.getItem('name');
readonly isAuthenticated = this.authService.isAuthenticated;
  get isAdmin(): boolean {
    return this.currentUser()?.user.role === 'ADMIN';
  }

  get isSupervisor(): boolean {
    return this.currentUser()?.user.role === 'SUPER_ADMIN';
  }

  logout(): void {
    this.authService.logout();
   // this.name = null;
    this.router.navigate(['/auth/login']);
  }
  toReservation()
  {
    this.router.navigate(['/my-reservations'])
  }
   toAdmin()
  {
    this.router.navigate(['/admin'])
  }
   toTransfers()
  {
    this.router.navigate(['/admin/transfers'])
  }
   toSupervisor()
  {
    this.router.navigate(['/supervisor'])
  }
   toHome()
  {
    this.router.navigate(['/event'])
  }
}