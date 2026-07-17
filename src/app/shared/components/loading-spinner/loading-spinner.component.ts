import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="cinema-spinner" role="status" aria-label="Loading">
      <div class="spinner-ring">
        <div class="spinner-segment"></div>
        <div class="spinner-segment"></div>
        <div class="spinner-segment"></div>
      </div>
    </div>
  `,
  styles: [`
    .cinema-spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .spinner-ring {
      position: relative;
      width: 24px;
      height: 24px;
    }

    .spinner-segment {
      position: absolute;
      inset: 0;
      border: 3px solid transparent;
      border-top-color: var(--clr-accent, #e50914);
      border-radius: 50%;
      animation: cinemaSpin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    .spinner-segment:nth-child(2) {
      inset: 3px;
      border-top-color: rgba(255, 255, 255, 0.3);
      animation-duration: 1.2s;
      animation-direction: reverse;
    }

    .spinner-segment:nth-child(3) {
      inset: 6px;
      border-top-color: var(--clr-gold, #f5c518);
      animation-duration: 1s;
    }

    @keyframes cinemaSpin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class LoadingSpinnerComponent {}