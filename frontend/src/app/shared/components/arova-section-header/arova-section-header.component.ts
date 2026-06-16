import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'arova-section-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="arova-section-header">
      <h2 class="title">{{ title }}</h2>
      <p class="description" *ngIf="description">{{ description }}</p>
    </div>
  `,
  styles: [`
    .arova-section-header {
      margin-top: 36px;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .title {
      font-family: 'Cormorant Garamond', 'Georgia', serif;
      font-size: 1.5rem;
      font-weight: 400;
      color: var(--arova-text-primary);
      letter-spacing: 0.02em;
    }
    
    .description {
      font-size: 0.88rem;
      color: var(--arova-text-secondary);
      margin-top: 2px;
    }
  `]
})
export class ArovaSectionHeaderComponent {
  @Input() title!: string;
  @Input() description?: string;
}
