import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="app-footer">
      <div class="cinema-container">
        <img src="../../assets/images/logo.png" alt="الشعار" 
        class="footer-logo" onerror="this.style.display='none'" />
        <p class="footer-text">جميع الحقوق محفوظة &copy; {{ currentYear }}</p>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: var(--clr-bg-secondary);
      border-top: 1px solid rgba(107, 78, 58, 0.1);
      padding: 1.5rem 0;
      text-align: center;
      margin-top: auto;
    }
    .footer-logo {
      height: 40px;
      margin-bottom: 0.5rem;
      object-fit: contain;
    }
    .footer-text {
      color: var(--clr-text-muted);
      font-size: 0.85rem;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}