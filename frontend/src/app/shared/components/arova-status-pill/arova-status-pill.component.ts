import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'arova-status-pill',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="arova-status-pill" [ngClass]="type">
      <span class="dot" *ngIf="showDot"></span>
      <span class="label"><ng-content></ng-content></span>
    </span>
  `,
  styles: [`
    .arova-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid transparent;
      line-height: 1;
    }
    
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    
    // Status Variant Colors
    .info {
      background: rgba(115, 140, 118, 0.12);
      border-color: rgba(115, 140, 118, 0.25);
      color: var(--arova-accent-soft);
      .dot { background: var(--arova-accent-soft); }
    }
    
    .accent {
      background: rgba(231, 166, 182, 0.12);
      border-color: rgba(231, 166, 182, 0.25);
      color: var(--arova-accent);
      .dot { background: var(--arova-accent); }
    }
    
    .success {
      background: rgba(55, 178, 77, 0.12);
      border-color: rgba(55, 178, 77, 0.25);
      color: var(--arova-success);
      .dot { background: var(--arova-success); }
    }
    
    .warning {
      background: rgba(252, 196, 25, 0.12);
      border-color: rgba(252, 196, 25, 0.25);
      color: var(--arova-warning);
      .dot { background: var(--arova-warning); }
    }
    
    .danger {
      background: rgba(240, 62, 62, 0.12);
      border-color: rgba(240, 62, 62, 0.25);
      color: var(--arova-danger);
      .dot { background: var(--arova-danger); }
    }
  `]
})
export class ArovaStatusPillComponent {
  @Input() type: 'success' | 'warning' | 'danger' | 'info' | 'accent' = 'info';
  @Input() showDot = true;
}
