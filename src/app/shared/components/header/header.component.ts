import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslationService, SupportedLang } from '../../../core/services/translation.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly currentLang = this.translationService.currentLang;
  readonly currentUser = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;

  get isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  switchLanguage(lang: SupportedLang): void {
    this.translationService.switchLanguage(lang);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}