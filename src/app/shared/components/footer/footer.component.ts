import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="app-footer">
      <div class="cinema-container">
               <p class="footer-text">كنيسة القديس يوحنا المعمدان بقليوب &copy; {{ currentYear }}</p>

        <div class="powered-by">
    <span>Powered by</span>
    <img src="../../assets/images/APElogo.png"
    class="footer-logo"
    alt="APE">
  </div>
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
      .cinema-container
      {
      width:400px;
      }
    .footer-logo {
      height: 20px;
      margin-bottom: 0.5rem;
      object-fit: contain;
    }
    .footer-text {
      color: var(--clr-text-muted);
      font-size: 0.85rem;
    }
      .powered-by{
      display:flex;
      justify-content:space-between;
      width:200px;
     
      align-items:center;
      margin:1px auto;
      }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}