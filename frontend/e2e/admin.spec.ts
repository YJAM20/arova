import { test, expect } from '@playwright/test';

// Helper to seed localStorage with completed onboarding for local mode
async function seedOnboardingCompleted(page) {
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
      memories: [
        { id: 'mem-1', title: 'Romantic Memory', description: 'Public description', privateNote: 'SUPER SECRET PRIVATE NOTE TEXT', visibleToPartner: true, createdByUserId: 'user-owner', createdAt: new Date().toISOString() }
      ],
      reasons: [],
      letters: [
        { id: 'let-1', title: 'Love Letter', body: 'CONFIDENTIAL SEALED LETTER BODY TEXT', isLocked: true, createdByUserId: 'user-owner', createdAt: new Date().toISOString(), category: 'future', visibilityLevel: 'Secret' }
      ],
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
  });
}

test.describe('Arova Admin Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should protect /admin path and redirect unauthorized users', async ({ page }) => {
    // Non-logged in user gets redirected to auth or login
    await page.goto('/admin');
    await page.waitForURL('**/auth');
    await expect(page).toHaveURL(/\/auth$/);
  });

  test('should allow access to admin for owner role, load engagement tab, and check privacy', async ({ page }) => {
    // Seed and login
    await page.goto('/');
    await seedOnboardingCompleted(page);

    await page.goto('/auth/login');
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');
    await page.locator('.login-btn').click();
    await page.waitForURL('**/universe');

    // Go to admin dashboard
    await page.goto('/admin');
    await page.waitForURL('**/admin');
    await expect(page).toHaveURL(/\/admin$/);

    // Switch to Engagement Tab
    const engTab = page.getByRole('tab', { name: /relationship engagement/i });
    await expect(engTab).toBeVisible();
    await engTab.click();

    // Check dashboard details
    await expect(page.locator('h2', { hasText: 'Relationship Engagement' })).toBeVisible();
    await expect(page.locator('.privacy-notice')).toContainText('Privacy Model Active');

    // Check stats cards render
    await expect(page.locator('.stat-card', { hasText: /Memories Saved/i })).toBeVisible();
    await expect(page.locator('.stat-card', { hasText: /Letters Vaulted/i })).toBeVisible();
    await expect(page.locator('.stat-card', { hasText: /Active Streak/i })).toBeVisible();
    await expect(page.locator('.stat-card', { hasText: /Orbit Points/i })).toBeVisible();

    // Verify privacy constraints: private note text and sealed letter body must NOT be visible/exposed anywhere on the page
    const pageText = await page.textContent('body');
    expect(pageText).not.toContain('SUPER SECRET PRIVATE NOTE TEXT');
    expect(pageText).not.toContain('CONFIDENTIAL SEALED LETTER BODY TEXT');
  });

  test('should display proper message in API Mode if backend is offline', async ({ page }) => {
    // Enable API mode and seed onboarding complete to avoid local layout redirect
    await page.goto('/');
    await seedOnboardingCompleted(page);
    await page.evaluate(() => {
      localStorage.setItem('love-universe-app-mode', 'api');
      localStorage.setItem('love-universe-api-token', 'dummy-token-placeholder');
    });

    // Mock setup status to bypass onboarding checks
    await page.route('**/api/setup/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isVerified: true,
          hasCompletedQuickOnboarding: true,
          hasCompletedProfile: true,
          hasCouple: true,
          hasSubscription: true
        }),
      });
    });

    // Mock auth check
    await page.route('**/api/auth/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'admin-id', displayName: 'System Admin', email: 'admin@arova.com', isSystemAdmin: true }),
      });
    });

    // Mock engagement endpoint failure (simulates backend offline)
    await page.route('**/api/admin/engagement**', route => {
      route.abort('failed');
    });

    await page.goto('/admin');
    await page.waitForURL('**/admin');

    // Switch to Engagement Tab
    const engTab = page.getByRole('tab', { name: /relationship engagement/i });
    await expect(engTab).toBeVisible();
    await engTab.click();

    // Should display offline error message instead of faking success
    await expect(page.locator('.engagement-error, div:has-text("Backend is not reachable")').first()).toBeVisible();
  });
});
