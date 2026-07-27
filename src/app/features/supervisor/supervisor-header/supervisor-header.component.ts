import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-supervisor-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supervisor-header.component.html',
  styleUrl: './supervisor-header.component.scss'
})
export class SupervisorHeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
