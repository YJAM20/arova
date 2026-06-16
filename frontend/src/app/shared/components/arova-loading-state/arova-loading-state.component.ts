import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'arova-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="arova-loading-state">
      <div class="spinner">
        <div class="orbit"></div>
        <div class="star">✦</div>
      </div>
      <p class="message" *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .arova-loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      min-height: 200px;
    }
    
    .spinner {
      position: relative;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .orbit {
      position: absolute;
      inset: 0;
      border: 1.5px solid rgba(231, 166, 182, 0.15);
      border-top-color: var(--arova-accent);
      border-radius: 50%;
      animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    
    .star {
      color: var(--arova-accent);
      font-size: 1.1rem;
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    .message {
      font-size: 0.9rem;
      color: var(--arova-text-secondary);
      letter-spacing: 0.05em;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.6; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.1); }
    }
    
    @media (prefers-reduced-motion: reduce) {
      .orbit, .star {
        animation: none !important;
      }
    }
  `]
})
export class ArovaLoadingStateComponent {
  @Input() message = 'Gathering stardust...';
}
