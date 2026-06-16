import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'arova-page-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 space-y-4">
      <div class="spinner-ring relative w-12 h-12">
        <div class="ring-back absolute inset-0 rounded-full border-2 border-purple-500/10"></div>
        <div class="ring-active absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-pink-500 animate-spin"></div>
      </div>
      <span class="loading-message text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {{ message }}
      </span>
    </div>
  `,
  styles: [`
    .spinner-ring {
      box-shadow: 0 0 15px rgba(168, 85, 247, 0.1);
    }
  `]
})
export class ArovaPageLoadingComponent {
  @Input() message = 'Syncing your space...';
}
