import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'arova-inline-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5 align-middle">
      <span [class]="'spinner border-2 rounded-full border-transparent animate-spin ' + sizeClass" [style.border-top-color]="color"></span>
      <span *ngIf="label" class="spinner-label text-xs font-semibold uppercase tracking-wider" [style.color]="labelColor">{{ label }}</span>
    </span>
  `,
  styles: [`
    .spinner {
      border-right-color: transparent;
      border-bottom-color: transparent;
      border-left-color: transparent;
    }
  `]
})
export class ArovaInlineSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';
  @Input() color = '#ffffff';
  @Input() label = '';
  @Input() labelColor = 'currentColor';

  get sizeClass(): string {
    switch (this.size) {
      case 'lg': return 'w-6 h-6';
      case 'md': return 'w-4 h-4';
      default: return 'w-3 h-3';
    }
  }
}
