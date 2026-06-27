import { test, expect, Page } from '@playwright/test';

// Helper to seed localStorage with completed onboarding for local mode
async function seedOnboardingCompleted(page: Page) {
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
        { id: 'user-partner', username: 'partner', passcode: '1234', displayName: 'Partner B', role: 'partner' }
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
        updatedAt: new Date().toISOString()
      }
    };
    localStorage.setItem('love-universe-data-v1', JSON.stringify(data));
    localStorage.setItem('love-universe-app-mode', 'local');
    localStorage.setItem(
      'love-universe-session-v1',
      JSON.stringify({
        id: 'user-owner',
        username: 'owner',
        passcode: '1234',
        displayName: 'Partner A',
        role: 'admin',
      })
    );
  });
}

test.describe('Arova Realtime Presence E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await seedOnboardingCompleted(page);
  });

  test('Local Mode clearly says realtime presence requires API Mode', async ({ page }) => {
    await page.goto('/universe');
    await page.waitForLoadState('networkidle');

    // Verify presence fallback warning is visible
    const localStatus = page.locator('#presence-local-status');
    await expect(localStatus).toBeVisible();
    await expect(localStatus).toContainText('Presence requires API Mode.');
  });

  test('Internal layout does not break with presence indicator', async ({ page }) => {
    await page.goto('/universe');
    await page.waitForLoadState('networkidle');

    // Verify main content and sidebar are both visible
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.main-content')).toBeVisible();
    await expect(page.locator('.desktop-presence-container')).toBeVisible();
  });

  test('/chat still loads and Local Mode chat works', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Verify chat loads
    await expect(page.locator('h1')).toContainText('A quiet room for two');
    
    // Type and send a message
    const textarea = page.locator('textarea');
    await textarea.fill('Hello E2E!');
    await page.getByRole('button', { name: /send message/i }).click();

    // Verify message appears in list
    await expect(page.locator('#chat-message-list')).toContainText('Hello E2E!');
  });

  test('No backend calls are made in Local Mode pages', async ({ page }) => {
    let backendCalled = false;
    await page.route('**/api/**', route => {
      backendCalled = true;
      route.continue();
    });

    await page.goto('/universe');
    await page.waitForLoadState('networkidle');
    expect(backendCalled).toBe(false);

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    expect(backendCalled).toBe(false);
  });

  test('API Mode offline does not fake presence success', async ({ page }) => {
    // Configure API Mode and token, but backend is offline (we mock backend returning 500 or network error)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('love-universe-app-mode', 'api');
      localStorage.setItem('love-universe-api-token', 'dummy-token');
      localStorage.setItem('love-universe-session-v1', JSON.stringify({
        id: 'user-owner',
        username: 'owner',
        displayName: 'Partner A',
        role: 'admin',
      }));
    });

    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    await page.goto('/universe');
    await page.waitForTimeout(1000);

    // Indicator should not display online presence success or fake connection
    const presenceStatus = page.locator('.presence-status').first();
    await expect(presenceStatus).toContainText('Partner is offline');
  });

  test('No false E2EE or push-notification claims exist in layout/chat', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Verify disclaimer exists and is honest about encryption
    const disclaimer = page.locator('#chat-disclaimer');
    await expect(disclaimer).toContainText(/true e2ee and production messaging infrastructure are planned, not active/i);
  });

  test('No horizontal overflow at 320px layout viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    
    // Check `/universe`
    await page.goto('/universe');
    await page.waitForLoadState('networkidle');
    let hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);

    // Check `/chat`
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);

    // Check `/settings`
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
  });
});
