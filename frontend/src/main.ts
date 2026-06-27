import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import { environment } from './environments/environment';

bootstrapApplication(App, appConfig)
  .then(() => {
    if (environment.production && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[PWA] Service Worker registered successfully', reg))
        .catch(err => console.warn('[PWA] Service Worker registration failed', err));
    }
  })
  .catch((err) => console.error(err));
