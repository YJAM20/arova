import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pwa-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showPrompt" class="pwa-install-banner fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md w-[calc(100%-2rem)] glass p-5 z-50 flex items-center justify-between gap-4 shadow-2xl animate-slide-up">
      <div class="prompt-text flex-1">
        <h4 class="text-sm font-bold text-white mb-0.5">Install Arova</h4>
        <p class="text-2xs text-neutral-300">Keep your private universe one tap away.</p>
      </div>
      <div class="prompt-actions flex gap-2">
        <button (click)="dismissPrompt()" class="btn-dismiss text-xs font-semibold px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white">
          Maybe later
        </button>
        <button (click)="installApp()" class="btn-install text-xs font-bold px-4 py-1.5 rounded-lg">
          Install
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pwa-install-banner {
      background: rgba(10, 20, 38, 0.85) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }

    .btn-dismiss {
      background: transparent;
      transition: color 0.2s ease;
      cursor: pointer;
    }

    .btn-install {
      background: linear-gradient(135deg, var(--theme-accent, #dfe0ff) 0%, var(--theme-accent-2, #f6be38) 100%);
      color: #051424;
      border: none;
      box-shadow: 0 4px 10px rgba(246, 190, 56, 0.15);
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover {
        opacity: 0.95;
        transform: translateY(-1px);
        box-shadow: 0 6px 15px rgba(246, 190, 56, 0.25);
      }
    }

    @keyframes slideUp {
      from {
        transform: translate(-50%, 100%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }

    .animate-slide-up {
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class PwaInstallPromptComponent implements OnInit {
  showPrompt = false;
  private deferredPrompt: any = null;
  private readonly DISMISS_KEY = 'arova-pwa-prompt-dismissed';

  ngOnInit(): void {
    // Check if user has already dismissed the prompt
    if (localStorage.getItem(this.DISMISS_KEY) === 'true') {
      this.showPrompt = false;
    }
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: Event): void {
    // Prevent default browser prompt
    event.preventDefault();
    this.deferredPrompt = event;

    // Only show the prompt if it hasn't been explicitly dismissed before
    if (localStorage.getItem(this.DISMISS_KEY) !== 'true') {
      this.showPrompt = true;
    }
  }

  installApp(): void {
    if (!this.deferredPrompt) return;

    this.showPrompt = false;
    this.deferredPrompt.prompt();

    this.deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
      this.deferredPrompt = null;
    });
  }

  dismissPrompt(): void {
    this.showPrompt = false;
    localStorage.setItem(this.DISMISS_KEY, 'true');
  }
}
