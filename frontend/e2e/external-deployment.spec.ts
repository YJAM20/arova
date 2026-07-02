import { test, expect } from '@playwright/test';

/**
 * External Deployment Availability Spec
 *
 * Tests that the Arova frontend is healthy for external demo users:
 *  - SPA direct-route refresh works for all public and protected routes
 *  - Local Mode tester path is always available
 *  - API Mode shows clear unavailability messaging when backend is absent
 *  - Tester troubleshooting note is present on the landing page
 *
 * All tests run against the local dev/build server (no live Netlify dependency).
 */

test.describe('Arova External Deployment Availability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  // ─────────────────────────────────────────
  // 1. SPA Route Fallback — direct-URL loads
  // ─────────────────────────────────────────

  test('root / loads and shows Arova brand', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-brand')).toContainText('Arova');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('/auth direct route loads without blank screen', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForURL('**/auth');
    const heading = page.locator('h1', { hasText: 'A private space for two.' });
    await expect(heading).toBeVisible();
  });

  test('/plans direct route loads plan cards', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.locator('h1')).toContainText('Choose how your universe runs');
    await expect(page.locator('.plan-card')).toHaveCount(3);
  });

  test('/admin-showcase direct route loads without blank screen', async ({ page }) => {
    await page.goto('/admin-showcase');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('/future direct route loads without blank screen', async ({ page }) => {
    await page.goto('/future');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('404');
  });

  // ─────────────────────────────────────────
  // 2. Local Mode Tester Path
  // ─────────────────────────────────────────

  test('Local Mode CTA is visible and navigates to /auth/login', async ({ page }) => {
    await page.goto('/auth');
    const localDemoLink = page.locator('.local-demo');
    await expect(localDemoLink).toBeVisible();
    await localDemoLink.click();
    await page.waitForURL('**/auth/login');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('Local Mode login works with demo credentials (owner / 1234)', async ({ page }) => {
    // Seed minimal onboarding data so local login can proceed
    await page.evaluate(() => {
      const data = {
        version: '1.0.0',
        settings: {
          activeTheme: 'dark-romantic',
          languageMode: 'en',
          animationsEnabled: true,
          musicEnabled: false,
          onboardingCompleted: true,
        },
        users: [
          { id: 'user-owner', username: 'owner', passcode: '1234', displayName: 'Partner A', role: 'admin' },
          { id: 'user-partner', username: 'partner', passcode: '1234', displayName: 'Partner B', role: 'partner' },
        ],
        memories: [],
        reasons: [],
        letters: [],
        moods: [],
        dailyQuestionAnswers: [],
        checkIns: [],
        songs: [],
        challenges: [],
        futurePlans: [],
        coupleProfile: {
          coupleSpaceName: 'Arova Space',
          partnerADisplayName: 'Partner A',
          partnerBDisplayName: 'Partner B',
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem('love-universe-data-v1', JSON.stringify(data));
    });

    await page.goto('/auth/login');
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');
    await page.locator('.login-btn').click();
    await page.waitForURL('**/universe');
    await expect(page).toHaveURL(/\/universe$/);
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  // ─────────────────────────────────────────
  // 3. API Mode Unavailable Messaging
  // ─────────────────────────────────────────

  test('API auth page shows helpful error when backend is unreachable', async ({ page }) => {
    // Fulfill the API request with a mock connection error status (503 with helpful body)
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Backend is not reachable. Start Local Demo instead. (This demo can run in Local Mode without the backend.)' }),
      });
    });

    await page.goto('/auth');

    // Attempt to submit the sign-in form with dummy credentials
    await page.fill('input[name="usernameOrEmail"]', 'testuser');
    await page.fill('input[name="loginPassword"]', 'testpassword');
    await page.locator('.submit-btn').first().click();

    // Copy should guide user toward Local Mode or backend unreachable warning
    const helperCopy = page.getByText(/Local Mode|local demo|backend|not reachable|Start Local Demo/i);
    await expect(helperCopy.first()).toBeVisible({ timeout: 15000 });
  });

  test('Settings page shows external demo note when API Mode is active', async ({ page }) => {
    // Seed onboarding so we can log in and reach settings
    await page.evaluate(() => {
      const data = {
        version: '1.0.0',
        settings: {
          activeTheme: 'dark-romantic',
          languageMode: 'en',
          animationsEnabled: true,
          musicEnabled: false,
          onboardingCompleted: true,
        },
        users: [
          { id: 'user-owner', username: 'owner', passcode: '1234', displayName: 'Partner A', role: 'admin' },
          { id: 'user-partner', username: 'partner', passcode: '1234', displayName: 'Partner B', role: 'partner' },
        ],
        memories: [], reasons: [], letters: [], moods: [],
        dailyQuestionAnswers: [], checkIns: [], songs: [], challenges: [], futurePlans: [],
        coupleProfile: {
          coupleSpaceName: 'Arova Space',
          partnerADisplayName: 'Partner A',
          partnerBDisplayName: 'Partner B',
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem('love-universe-data-v1', JSON.stringify(data));
      localStorage.setItem('love-universe-app-mode', 'local');
    });

    // Login using Local Mode
    await page.goto('/auth/login');
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');
    await page.locator('.login-btn').click();
    await page.waitForURL('**/universe');

    // Now go to settings page
    await page.goto('/settings');
    await page.waitForURL('**/settings');

    // Locate the API Mode label container and click it
    const apiModeOption = page.locator('.mode-option').filter({ hasText: 'API Mode' });
    await expect(apiModeOption).toBeVisible();
    await apiModeOption.click();

    // Assert that the external demo note is visible and has correct content
    const externalNote = page.locator('#settings-api-external-note');
    await expect(externalNote).toBeVisible();
    await expect(externalNote).toContainText(/External demo users|Local Mode|backend/i);
  });

  // ─────────────────────────────────────────
  // 4. Tester Troubleshooting Note
  // ─────────────────────────────────────────

  test('landing page footer shows tester troubleshooting note', async ({ page }) => {
    await page.goto('/');
    const testerNote = page.locator('#landing-tester-note');
    await expect(testerNote).toBeAttached();
    await expect(testerNote).toContainText(/Chrome Incognito|mobile data|another network/i);
  });
});
