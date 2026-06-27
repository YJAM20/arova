import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'arova-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="arova-empty-state animate-fade-in">
      <div class="icon-circle">
        <span class="icon">{{ icon }}</span>
      </div>
      <h3 class="title">{{ title }}</h3>
      <p class="description">{{ description }}</p>
      <div class="actions" *ngIf="actionText && actionLink">
        <a [routerLink]="actionLink" class="empty-btn">{{ actionText }}</a>
      </div>
    </div>
  `,
  styles: [`
    .arova-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 24px;
      background: var(--theme-card);
      border: 1px dashed var(--arova-border);
      border-radius: var(--arova-radius-lg);
      backdrop-filter: blur(8px);
      max-width: 600px;
      margin: 40px auto;
    }
    
    .icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(115, 140, 118, 0.1);
      border: 1px solid var(--arova-border);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      box-shadow: 0 0 15px rgba(115, 140, 118, 0.05);
    }
    
    .icon {
      font-size: 1.5rem;
      color: var(--arova-accent-soft);
    }
    
    .title {
      font-family: var(--font-display, 'Playfair Display', serif);
      font-size: 1.6rem;
      color: var(--arova-text-primary);
      margin-bottom: 8px;
      font-weight: 400;
    }
    
    .description {
      font-size: 0.95rem;
      color: var(--arova-text-secondary);
      max-width: 380px;
      line-height: 1.5;
    }
    
    .actions {
      margin-top: 24px;
    }
    
    .empty-btn {
      display: inline-block;
      padding: 10px 20px;
      background: rgba(231, 166, 182, 0.08);
      border: 1px solid var(--arova-accent);
      border-radius: var(--arova-radius-sm);
      color: var(--arova-accent) !important;
      font-size: 0.88rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      transition: all var(--arova-transition-fast);
      cursor: pointer;
    }
    
    .empty-btn:hover {
      background: rgba(231, 166, 182, 0.15);
      box-shadow: 0 0 10px rgba(231, 166, 182, 0.1);
    }
  `]
})
export class ArovaEmptyStateComponent {
  @Input() icon = '✧';
  @Input() title!: string;
  @Input() description!: string;
  @Input() actionText?: string;
  @Input() actionLink?: string;
}
