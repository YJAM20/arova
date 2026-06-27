import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Arova PWA & Installable Shell E2E Tests', () => {

  test('Manifest is linked from index.html', async ({ page }) => {
    await page.goto('/');
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', 'manifest.webmanifest');
  });

  test('Manifest file exists and has correct metadata', async ({ page }) => {
    // Read manifest directly from the public folder to check structure
    const manifestPath = path.join(__dirname, '..', 'public', 'manifest.webmanifest');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.name).toBe('Arova');
    expect(manifest.short_name).toBe('Arova');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.orientation).toBe('portrait-primary');
    expect(manifest.theme_color.toLowerCase()).toBe('#051424');
    expect(manifest.background_color.toLowerCase()).toBe('#051424');
    expect(manifest.categories).toContain('lifestyle');
    expect(manifest.categories).toContain('productivity');
    expect(manifest.categories).toContain('social');
  });

  test('/offline route loads and displays honesty details', async ({ page }) => {
    await page.goto('/offline');
    await page.waitForLoadState('networkidle');

    // 1. Heading assertion
    const heading = page.locator('h1');
    await expect(heading).toContainText('You’re offline.');

    // 2. Honesty copy assertion
    const bodyText = page.locator('.offline-card');
    await expect(bodyText).toContainText(
      'Local Mode can still use data saved in this browser. API Mode needs your backend connection to sync.'
    );

    // 3. Button assertions
    const retryBtn = page.getByRole('button', { name: /retry connection/i });
    const localDemoBtn = page.getByRole('button', { name: /go to local demo/i });
    const backHomeLink = page.getByRole('link', { name: /back to home/i });

    await expect(retryBtn).toBeVisible();
    await expect(localDemoBtn).toBeVisible();
    await expect(backHomeLink).toBeVisible();
  });

  test('Public pages load and protected routes redirect properly', async ({ page }) => {
    // Public landing page loads
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Create a private universe for two.');

    // Protected route redirect check
    // Clear localStorage to ensure we are logged out
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Visit /universe and ensure it redirects to /auth or /
    await page.goto('/universe');
    await page.waitForURL('**/auth');
    expect(page.url()).toContain('/auth');
  });

  test('Offline page fits perfectly inside 320px viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/offline');
    await page.waitForLoadState('networkidle');

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
  });

  test('No false claims of background sync, production push, or encrypted vault exist in offline screen', async ({ page }) => {
    await page.goto('/offline');
    const content = await page.locator('.offline-page').textContent();

    // Verify disclaimers and honesty: make sure we do not claim full push/sync
    expect(content).not.toContain('background sync');
    expect(content).not.toContain('push notifications');
    expect(content).not.toContain('encrypted offline vault');
    expect(content).not.toContain('production E2EE');
  });
});
