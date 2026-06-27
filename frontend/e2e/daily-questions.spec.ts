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

test.describe('Arova Daily Questions Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await seedOnboardingCompleted(page);
    
    // Log in (defaults to Local Mode)
    await page.goto('/auth/login');
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');
    await page.locator('.login-btn').click();
    await page.waitForURL('**/universe');
  });

  test('Daily Questions works in Local Mode without backend calls', async ({ page }) => {
    let backendCalled = false;
    await page.route('**/api/**', () => {
      backendCalled = true;
    });

    await page.goto('/daily-questions');
    await page.waitForURL('**/daily-questions');

    // Header and question prompt check
    await expect(page.locator('h1')).toContainText('A small prompt for today');
    await expect(page.locator('.question-card h2')).toBeVisible();

    // Type answer
    const textarea = page.locator('#answer');
    await textarea.fill('This is a local mode test answer.');
    
    // Submit answer
    await page.locator('.primary-action').click();

    // Verify local mode saving message
    await expect(page.locator('.message')).toContainText(/saved locally/i);

    // Verify it added to today's answers
    await expect(page.locator('.answer-list')).toContainText('This is a local mode test answer.');
    expect(backendCalled).toBe(false);
  });

  test('API Mode calls correct API endpoints and shows error when offline', async ({ page }) => {
    // Switch to API Mode
    await page.goto('/settings');
    await page.waitForURL('**/settings');
    
    // Click API Mode radio button
    const apiModeOption = page.locator('.mode-option').filter({ hasText: 'API Mode' });
    await apiModeOption.locator('input[type="radio"]').check();
    
    // Save settings
    await page.locator('#settings-save-btn').click();

    // Set API token to bypass auth guard redirect
    await page.evaluate(() => {
      localStorage.setItem(
        'love-universe-api-token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLW93bmVyIiwidXNlcklkIjoidXNlci1vd25lciJ9.signature'
      );
    });

    // Mock /api/auth/me to succeed so token validation passes
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'user-owner', username: 'owner', displayName: 'Partner A', role: 'admin' }),
      });
    });

    // Go to daily-questions and mock API calls failing (offline backend)
    await page.route('**/api/daily-questions/today', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/daily-questions');
    
    // Should display readable error state
    const errorBanner = page.locator('.error-banner');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(/could not connect to backend/i);
  });
});
