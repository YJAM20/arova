import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AppModeService } from '../../../core/services/app-mode.service';

@Component({
  selector: 'app-backend-offline',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="offline-page fixed inset-0 flex flex-col items-center justify-center z-50 p-6 bg-[#051424] stars-bg">
      <div class="offline-card glass max-w-md w-full p-8 text-center space-y-6">
        <div class="visual-wrapper relative w-24 h-24 mx-auto flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full shadow-glow">
          <span class="text-5xl">📡</span>
          <span class="offline-indicator absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-[#051424] animate-ping"></span>
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl font-extrabold text-white">Space Link Offline</h1>
          <p class="text-sm text-neutral-300">
            We could not reach Arova’s backend. You can retry the connection or continue with local mode if available.
          </p>
        </div>

        <div class="tips-box p-4 bg-white/3 rounded-xl border border-white/5 text-left text-xs text-neutral-400 space-y-2">
          <strong class="text-neutral-200">Tips to reconnect:</strong>
          <ul class="list-disc pl-4 space-y-1">
            <li>Verify you have executed <code class="bg-black/30 px-1 py-0.5 rounded font-mono">dotnet run</code> inside the backend folder.</li>
            <li>If you want to review features without the server, you can switch to local mode.</li>
          </ul>
        </div>

        <div class="actions flex flex-wrap gap-3 justify-center">
          <button (click)="checkConnection()" class="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
            🔄 Retry connection
          </button>
          <a routerLink="/settings" class="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold">
            ⚙️ Open settings
          </a>
          <button (click)="continueLocally()" class="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold">
            🏠 Continue locally
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .offline-page {
      animation: fadeIn 0.4s ease-out;
    }

    .offline-card {
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(25, 20, 35, 0.65);
      backdrop-filter: blur(24px);
    }

    .visual-wrapper {
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--theme-accent, #dfe0ff) 0%, var(--theme-accent-2, #f6be38) 100%);
      color: #051424;
      border: none;
      box-shadow: 0 4px 15px rgba(254, 240, 138, 0.25);
      transition: all 0.2s ease;
      cursor: pointer;
      
      &:hover {
        opacity: 0.95;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(254, 240, 138, 0.35);
      }
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e5e5e5;
      transition: all 0.2s ease;
      cursor: pointer;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }
  `]
})
export class BackendOfflinePageComponent {
  constructor(
    private appMode: AppModeService,
    private router: Router
  ) {}

  checkConnection(): void {
    window.location.reload();
  }

  continueLocally(): void {
    this.appMode.setMode('local');
    this.router.navigate(['/universe']);
  }
}
