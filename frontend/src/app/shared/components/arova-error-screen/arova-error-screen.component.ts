import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'arova-error-screen',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="error-container flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-6">
      <div class="error-visual w-20 h-20 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 shadow-glow">
        <span class="text-4xl">⚠️</span>
      </div>

      <div class="space-y-2">
        <h2 class="text-2xl font-extrabold text-white">{{ title }}</h2>
        <p class="text-sm text-neutral-300">{{ message }}</p>
      </div>

      <div class="actions-group flex flex-col sm:flex-row gap-3 w-full justify-center">
        <button *ngIf="showRetry" (click)="retry.emit()" class="btn-retry px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
          🔄 Try Again
        </button>
        <a routerLink="/universe" class="btn-home px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
          🪐 Back to Universe
        </a>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      min-height: 360px;
      animation: fadeIn 0.4s ease-out;
    }

    .error-visual {
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
    }

    .btn-retry {
      background: linear-gradient(135deg, var(--primary-color, #a855f7) 0%, var(--accent-color, #ec4899) 100%);
      color: white;
      border: none;
      box-shadow: 0 4px 15px rgba(168, 85, 247, 0.25);
      transition: all 0.2s ease;
      
      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(168, 85, 247, 0.35);
      }
    }

    .btn-home {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e5e5e5;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }
  `]
})
export class ArovaErrorScreenComponent {
  @Input() title = 'Unexpected Error';
  @Input() message = 'A cosmic storm disrupted Arova. Please verify coordinates and reload.';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
}
