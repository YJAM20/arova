import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'arova-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card glass p-6 rounded-2xl relative overflow-hidden space-y-4">
      <div class="shimmer-effect absolute inset-0"></div>
      
      <!-- Card Image/Icon Skeleton -->
      <div *ngIf="showVisual" class="skeleton-visual w-full aspect-video rounded-xl bg-white/5"></div>
      
      <!-- Lines Skeletons -->
      <div class="space-y-2">
        <div class="skeleton-line h-5 w-2/3 rounded bg-white/10"></div>
        <div class="skeleton-line h-3.5 w-full rounded bg-white/5"></div>
        <div class="skeleton-line h-3.5 w-4/5 rounded bg-white/5"></div>
      </div>

      <!-- Footer Action Skeleton -->
      <div class="flex items-center justify-between pt-2 border-t border-white/5">
        <div class="skeleton-line h-3 w-1/4 rounded bg-white/5"></div>
        <div class="skeleton-line h-6 w-16 rounded-lg bg-white/10"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: rgba(25, 20, 35, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .shimmer-effect {
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.03) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      background-size: 200% 100%;
      animation: shimmerMove 1.6s infinite;
    }

    @keyframes shimmerMove {
      0% { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
  `]
})
export class ArovaSkeletonCardComponent {
  @Input() showVisual = false;
}
