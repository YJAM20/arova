import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'arova-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="arova-page-header">
      <div class="header-content">
        <p class="eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>
        <h1 class="title">{{ title }}</h1>
        <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </header>
  `,
  styles: [`
    .arova-page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
      margin-bottom: 36px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--arova-border);
    }
    .header-content {
      flex: 1;
    }
    .eyebrow {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--arova-accent-soft);
      margin-bottom: 8px;
    }
    .title {
      font-family: 'Cormorant Garamond', 'Georgia', serif;
      font-size: 2.2rem;
      font-weight: 400;
      color: var(--arova-text-primary);
      line-height: 1.1;
    }
    .subtitle {
      font-size: 0.95rem;
      color: var(--arova-text-secondary);
      margin-top: 6px;
    }
    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    @media (max-width: 768px) {
      .arova-page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 24px;
      }
      .title {
        font-size: 1.8rem;
      }
    }
  `]
})
export class ArovaPageHeaderComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() eyebrow?: string;
}
