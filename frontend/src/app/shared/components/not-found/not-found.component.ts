import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-page fixed inset-0 flex flex-col items-center justify-center p-6 bg-[#161120] stars-bg z-50">
      <div class="content-card glass max-w-md w-full p-8 text-center space-y-6">
        <div class="visual-wrapper relative w-28 h-28 mx-auto flex items-center justify-center">
          <div class="orbiting-dot absolute inset-0 rounded-full border border-purple-500/20"></div>
          <div class="planet absolute w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-glow top-0 left-1/2 -ml-2.5 -mt-2.5"></div>
          <span class="text-5xl z-10 font-bold tracking-tighter text-white font-display">404</span>
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl font-extrabold text-white">Lost in Space</h1>
          <p class="text-sm text-neutral-300">
            This page drifted outside your shared space.
          </p>
        </div>

        <div class="actions flex gap-3 justify-center">
          <a routerLink="/universe" class="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
            🪐 Return to Universe
          </a>
          <a routerLink="/auth" class="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold">
            🔑 Go to Sign In
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      animation: fadeIn 0.4s ease-out;
    }

    .content-card {
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(25, 20, 35, 0.65);
      backdrop-filter: blur(24px);
    }

    .visual-wrapper {
      .orbiting-dot {
        animation: spinOrbit 4s linear infinite;
      }
      
      .planet {
        box-shadow: 0 0 15px #d946ef;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--theme-accent, #dfe0ff) 0%, var(--theme-accent-2, #f6be38) 100%);
      color: #051424;
      border: none;
      box-shadow: 0 4px 15px rgba(254, 240, 138, 0.25);
      transition: all 0.2s ease;
      
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
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }

    @keyframes spinOrbit {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class NotFoundPageComponent {}

