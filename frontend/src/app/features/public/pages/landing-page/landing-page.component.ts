import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, AfterViewInit, OnDestroy, inject, NgZone, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BRAND_CONFIG } from '../../../../core/config/brand.config';
import { AuthService } from '../../../../core/services/auth.service';
import { StorageService } from '../../../../core/services/storage.service';
import { FeedbackApiService } from '../../../../core/services/feedback-api.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly brand = BRAND_CONFIG;
  readonly scrollVideoUrl = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260616_212935_bbf608da-62d1-4f25-9be4-c346e4d09cc8.mp4';

  @ViewChild('scrollVideo') scrollVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('particlesCanvas') particlesCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('cardsTrigger') cardsTrigger?: ElementRef<HTMLElement>;
  @ViewChild('fixedCards') fixedCards?: ElementRef<HTMLElement>;
  @ViewChild('finalReveal') finalReveal?: ElementRef<HTMLElement>;

  menuOpen = false;
  heroOpacity = 1;
  cardsOpacity = 0;
  cardsClipPath = 'inset(0 100% 0 0)';
  cardsPointerEvents = 'none';
  finalRevealVisible = false;

  private rafId?: number;
  private particleRafId?: number;
  private observer?: IntersectionObserver;
  prefersReducedMotion = false;

  private latestScrollY = 0;
  private latestTriggerRectTop = 0;
  private latestTriggerRectHeight = 0;
  private scrollPending = false;
  private resizeListener?: () => void;
  private particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number }> = [];
  private particleCount = 0;

  feedback = { name: '', email: '', message: '' };
  feedbackSent = false;
  isBusy = false;
  errorMessage = '';

  private elementRef = inject(ElementRef);
  private auth = inject(AuthService);
  private storage = inject(StorageService);
  private router = inject(Router);
  private feedbackApi = inject(FeedbackApiService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    if (this.auth.isLoggedIn() && this.storage.getSettings().onboardingCompleted) {
      this.router.navigate(['/universe']);
    }
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      this.initParticles();
      this.initFinalRevealObserver();

      // Setup scroll listener
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.onScroll(); // trigger initial layout setup
      
      this.startAnimationLoop();
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll);
      if (this.resizeListener) {
        window.removeEventListener('resize', this.resizeListener);
      }
    }
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.particleRafId) cancelAnimationFrame(this.particleRafId);
    this.observer?.disconnect();
  }

  private onScroll = () => {
    this.latestScrollY = window.scrollY;
    if (this.cardsTrigger?.nativeElement) {
      const rect = this.cardsTrigger.nativeElement.getBoundingClientRect();
      this.latestTriggerRectTop = rect.top;
      this.latestTriggerRectHeight = rect.height;
    }
    this.scrollPending = true;
  };

  private startAnimationLoop(): void {
    const tick = () => {
      if (this.scrollPending) {
        this.scrollPending = false;
        this.updateScrollEffects();
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private updateScrollEffects(): void {
    const scrollPos = this.latestScrollY;
    const windowHeight = window.innerHeight;

    // 1. Hero opacity fade out during the first 35% of the viewport scroll
    const heroFadeEnd = windowHeight * 0.35;
    if (scrollPos <= heroFadeEnd) {
      this.heroOpacity = Math.max(0, 1 - scrollPos / heroFadeEnd);
    } else {
      this.heroOpacity = 0;
    }

    // 2. Scroll-scrubbing video position
    if (this.scrollVideo?.nativeElement) {
      const video = this.scrollVideo.nativeElement;
      if (video.duration && Number.isFinite(video.duration)) {
        // Start after 40% viewport scroll, end near bottom
        const scrubStart = windowHeight * 0.4;
        const totalScroll = document.documentElement.scrollHeight - windowHeight;
        const scrubEnd = Math.max(scrubStart + 100, totalScroll);

        let progress = 0;
        if (scrollPos > scrubStart) {
          progress = Math.min(1, (scrollPos - scrubStart) / (scrubEnd - scrubStart));
        }

        const targetTime = progress * video.duration;
        if (Math.abs(video.currentTime - targetTime) > 0.04) {
          video.currentTime = targetTime;
        }
      }
    }

    // 3. Scroll revealed cards logic
    if (this.cardsTrigger?.nativeElement) {
      const triggerTop = this.latestTriggerRectTop;
      const triggerHeight = this.latestTriggerRectHeight;
      const totalRange = windowHeight + triggerHeight;

      let progress = 0;
      if (triggerTop <= windowHeight) {
        progress = Math.min(1, (windowHeight - triggerTop) / totalRange);
      }

      // Reveal / Fade config
      const fadeInEnd = 0.2;
      const fadeOutStart = 0.8;

      let cardsOp = 0;
      let clipPercent = 0;

      if (progress < fadeInEnd) {
        cardsOp = progress / fadeInEnd;
        clipPercent = cardsOp * 100;
      } else if (progress >= fadeInEnd && progress <= fadeOutStart) {
        cardsOp = 1;
        clipPercent = 100;
      } else {
        cardsOp = Math.max(0, 1 - (progress - fadeOutStart) / (1 - fadeOutStart));
        clipPercent = 100;
      }

      this.cardsOpacity = cardsOp;
      this.cardsPointerEvents = cardsOp > 0.1 ? 'auto' : 'none';

      // Horizontal mask on desktop, vertical mask on mobile
      if (window.innerWidth >= 768) {
        this.cardsClipPath = `inset(0 ${(100 - clipPercent).toFixed(1)}% 0 0)`;
      } else {
        this.cardsClipPath = `inset(0 0 ${(100 - clipPercent).toFixed(1)}% 0)`;
      }
    }

    this.cdr.detectChanges();
  }

  private initParticles(): void {
    if (typeof window === 'undefined' || !this.particlesCanvas?.nativeElement) {
      return;
    }
    const canvas = this.particlesCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.particleCount = Math.min(120, Math.floor((canvas.width * canvas.height) / 14000));
      this.createParticles(canvas.width, canvas.height);
      
      // If motion is reduced, render static dots once on resize
      if (this.prefersReducedMotion) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };

    window.addEventListener('resize', resize, { passive: true });
    this.resizeListener = resize;
    resize();

    if (this.prefersReducedMotion) {
      return; // static dots are drawn once, no tick loop needed
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      this.particleRafId = requestAnimationFrame(render);
    };

    this.particleRafId = requestAnimationFrame(render);
  }

  private createParticles(width: number, height: number): void {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.2 + 0.4,
        alpha: Math.random() * 0.35 + 0.05
      });
    }
  }

  private initFinalRevealObserver(): void {
    if (typeof window === 'undefined' || !this.finalReveal?.nativeElement) return;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.finalRevealVisible = true;
          this.cdr.detectChanges();
          this.observer?.disconnect();
        }
      });
    }, { threshold: 0.1 });
    this.observer.observe(this.finalReveal.nativeElement);
  }

  sendFeedback(): void {
    if (!this.feedback.message.trim()) return;
    this.isBusy = true;
    this.errorMessage = '';
    this.feedbackSent = false;

    this.feedbackApi.sendFeedback({
      name: this.feedback.name.trim() || undefined,
      email: this.feedback.email.trim() || undefined,
      message: this.feedback.message.trim(),
      context: 'Landing Page'
    }).subscribe({
      next: () => {
        this.feedbackSent = true;
        this.feedback.message = '';
        this.isBusy = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Could not send feedback. Please try again.';
        this.isBusy = false;
        this.cdr.detectChanges();
      }
    });
  }
}
