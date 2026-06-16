import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'arova-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="arova-card" 
      [class.hoverable]="hoverable" 
      [class.glow]="glow" 
      [style.border-color]="borderColor || ''"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .arova-card {
      background: var(--theme-card);
      border: 1px solid var(--arova-border);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: var(--arova-radius-md);
      padding: 24px;
      transition: transform var(--arova-transition-normal), 
                  box-shadow var(--arova-transition-normal), 
                  border-color var(--arova-transition-normal), 
                  background-color var(--arova-transition-normal);
      position: relative;
      overflow: hidden;
    }
    
    .hoverable:hover {
      transform: translateY(-2px);
      border-color: var(--arova-accent);
      box-shadow: var(--arova-shadow-card);
      background: color-mix(in srgb, var(--theme-surface) 90%, var(--theme-accent) 10%) !important;
    }
    
    .glow {
      box-shadow: 0 0 15px rgba(231, 166, 182, 0.1);
    }
    
    @media (prefers-reduced-motion: reduce) {
      .arova-card {
        transition: none !important;
        transform: none !important;
      }
      .hoverable:hover {
        transform: none !important;
      }
    }
  `]
})
export class ArovaCardComponent {
  @Input() hoverable = true;
  @Input() glow = false;
  @Input() borderColor?: string;
}
