import { test, expect } from '@playwright/test';

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
  });
}

test.describe('Arova Loading and Error Screen E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await seedOnboardingCompleted(page);
    
    // Log in
    await page.goto('/auth/login');
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');
    await page.locator('.login-btn').click();
    await page.waitForURL('**/universe');
  });

  test('should render cosmic 404 page when route does not exist', async ({ page }) => {
    // Navigate to a non-existent child route of main-layout
    await page.goto('/universe/non-existent-page');
    await page.waitForURL('**/404');
    
    // Check that we see the cosmic 404 page
    await expect(page.locator('.not-found-page')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Lost in Space');
    
    // Verify the return button works
    const returnBtn = page.locator('.btn-primary');
    await expect(returnBtn).toBeVisible();
    await returnBtn.click();
    
    await page.waitForURL('**/universe');
    await expect(page).toHaveURL(/\/universe$/);
  });

  test('should render space link offline page on /offline', async ({ page }) => {
    // Navigate to /offline
    await page.goto('/offline');
    await page.waitForURL('**/offline');
    
    // Check that we see the offline card
    await expect(page.locator('.offline-page')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Space Link Offline');
    
    // Verify settings button works
    const settingsBtn = page.locator('a[routerLink="/settings"]');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();
    
    await page.waitForURL('**/settings');
    await expect(page).toHaveURL(/\/settings$/);
  });
});
