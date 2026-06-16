import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'arova-app-loading-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay fixed inset-0 flex flex-col items-center justify-center z-50">
      <div class="space-background absolute inset-0">
        <canvas id="space-canvas" class="w-full h-full block"></canvas>
      </div>
      <div class="content-wrapper text-center z-10 space-y-6 max-w-sm px-6">
        <!-- Celestial Orbit Ring Loader -->
        <div class="loader-orbit relative w-24 h-24 mx-auto flex items-center justify-center">
          <div class="orbital-ring absolute inset-0 rounded-full border border-purple-500/20"></div>
          <div class="orbital-planet absolute w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-glow"></div>
          <div class="inner-spark absolute text-2xl text-pink-300 animate-pulse">✦</div>
        </div>

        <div class="brand-group">
          <h2 class="brand-name text-3xl font-extrabold tracking-widest text-white mb-2">AROVA</h2>
          <p class="brand-line text-xs uppercase tracking-widest text-pink-400 font-semibold">A private space for two</p>
        </div>

        <div class="loading-message-box p-3 bg-white/3 border border-white/5 rounded-xl backdrop-blur-md">
          <p class="loading-text text-sm text-neutral-300 font-medium tracking-wide">
            {{ message }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      background-color: #0c0a11;
      overflow: hidden;
    }
    
    .space-background {
      opacity: 0.6;
    }

    .loader-orbit {
      animation: orbitRotate 3s linear infinite;
      
      .orbital-planet {
        top: 0;
        left: 50%;
        margin-left: -8px;
        margin-top: -8px;
        box-shadow: 0 0 15px #d946ef;
        animation: pulseSize 1.5s ease-in-out infinite alternate;
      }
      
      .inner-spark {
        animation: rotationReverse 3s linear infinite;
      }
    }

    .brand-name {
      font-family: 'Cormorant Garamond', serif;
      text-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
    }

    @keyframes orbitRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes rotationReverse {
      from { transform: rotate(360deg); }
      to { transform: rotate(0deg); }
    }

    @keyframes pulseSize {
      from { transform: scale(0.9); }
      to { transform: scale(1.15); }
    }
  `]
})
export class ArovaAppLoadingScreenComponent implements OnInit, OnDestroy {
  @Input() message = 'Preparing your shared space...';
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private animationId = 0;
  private stars: Array<{x: number, y: number, r: number, alpha: number, speed: number}> = [];

  ngOnInit(): void {
    setTimeout(() => {
      this.initCanvas();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private initCanvas(): void {
    const canvas = document.getElementById('space-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    this.canvasCtx = canvas.getContext('2d');
    if (!this.canvasCtx) return;
    this.canvasCtx.scale(dpr, dpr);

    // Initialize 60 starry points
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005
      });
    }

    this.drawStars(rect.width, rect.height);
  }

  private drawStars(width: number, height: number): void {
    if (!this.canvasCtx) return;
    const ctx = this.canvasCtx;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'white';

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) {
        s.speed = -s.speed;
      }
      ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this.drawStars(width, height));
  }
}
