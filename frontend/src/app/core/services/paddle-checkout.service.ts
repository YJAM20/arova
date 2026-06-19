import { Injectable } from '@angular/core';
import { PADDLE_CONFIG } from '../config/paddle.config';

declare global {
  interface Window {
    Paddle?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PaddleCheckoutService {
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Dynamically loads the Paddle.js SDK script from the official CDN.
   * Ensures it is loaded and initialized exactly once.
   */
  loadPaddle(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      // If Paddle is already available globally, use it.
      if (window.Paddle) {
        this.isLoaded = true;
        try {
          this.initializePaddle();
          resolve();
        } catch (err) {
          reject(err);
        }
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      script.onload = () => {
        if (window.Paddle) {
          this.isLoaded = true;
          try {
            this.initializePaddle();
            resolve();
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error('Paddle.js was loaded but the global Paddle object is missing.'));
        }
      };
      script.onerror = () => {
        this.loadPromise = null; // Allow retry on failure
        reject(new Error('Failed to load Paddle.js SDK script from CDN. Check your network connection.'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  private initializePaddle(): void {
    if (!window.Paddle) {
      throw new Error('Paddle SDK is not available.');
    }
    // Set environment to sandbox before initializing
    window.Paddle.Environment.set(PADDLE_CONFIG.environment);
    window.Paddle.Initialize({ token: PADDLE_CONFIG.clientToken });
  }

  /**
   * Opens the Paddle overlay checkout for the given price ID.
   * Returns a promise that resolves when the checkout opens or rejects on error.
   */
  openCheckout(priceId: string): Promise<void> {
    return this.loadPaddle().then(() => {
      if (!window.Paddle) {
        throw new Error('Paddle SDK is not initialized.');
      }
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }]
      });
    });
  }
}
