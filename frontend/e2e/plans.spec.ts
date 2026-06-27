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

test.describe('Arova E2E Plans Page Comparison Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a clean slate
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('1. plans/checkout page loads in Local Mode', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('love-universe-app-mode', 'local'));
    await page.goto('/plans');

    await expect(page.locator('h1')).toContainText('Choose how your universe runs');
    await expect(page.locator('.active-mode-banner')).toContainText('Local Mode');
  });

  test('2. Local Mode card clearly says browser-local', async ({ page }) => {
    await page.goto('/plans');
    const localModeCard = page.locator('article.mode-card', { hasText: 'Local Mode' });
    await expect(localModeCard).toBeVisible();
    await expect(localModeCard).toContainText('browser-local');
  });

  test('3. API Mode card clearly says backend required', async ({ page }) => {
    await page.goto('/plans');
    const apiModeCard = page.locator('article.mode-card', { hasText: 'API Mode' });
    await expect(apiModeCard).toBeVisible();
    await expect(apiModeCard).toContainText('backend required');
  });

  test('4. Feature matrix renders', async ({ page }) => {
    await page.goto('/plans');
    const featureMatrix = page.locator('.comparison-table');
    await expect(featureMatrix).toBeVisible();
    await expect(featureMatrix.locator('thead tr')).toContainText('Local Mode');
    await expect(featureMatrix.locator('thead tr')).toContainText('API Mode');
  });

  test('5. Page does not claim real payments are processed', async ({ page }) => {
    await page.goto('/plans');
    const bodyText = await page.textContent('body');
    
    // Positive checks for preview/honesty assertions
    await expect(page.locator('.table-disclaimer')).toContainText('Real payments are not processed in this demo');
    
    // Negative checks to prevent misleading claims
    expect(bodyText).not.toContain('Your card was charged');
    expect(bodyText).not.toContain('Subscription activated');
  });

  test('6. Page does not claim true E2EE is active', async ({ page }) => {
    await page.goto('/plans');
    
    // Assert on matrix row or FAQ
    const e2eRow = page.locator('.comparison-table tr', { hasText: 'True end-to-end encryption' });
    await expect(e2eRow).toContainText('Not yet');
    
    const e2eFaq = page.locator('.faq-item', { hasText: 'Is Arova end-to-end encrypted?' });
    await expect(e2eFaq).toContainText('planned, but not active in this demo');
  });

  test('7. Page does not claim Local Mode syncs across devices', async ({ page }) => {
    await page.goto('/plans');
    const localModeCard = page.locator('article.mode-card', { hasText: 'Local Mode' });
    await expect(localModeCard).toContainText('Does not sync across devices');
  });

  test('8. Local Mode does not call backend', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/api/**', async (route) => {
      apiCalled = true;
      await route.abort();
    });

    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('love-universe-app-mode', 'local'));
    await page.goto('/plans');
    
    // Wait a brief period to ensure no async calls trigger
    await page.waitForTimeout(500);
    expect(apiCalled).toBe(false);
  });

  test('9. API Mode offline shows friendly unavailable/configuration message', async ({ page }) => {
    await page.route('**/api/plans', route => route.abort());
    
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('love-universe-app-mode', 'api');
    });
    
    await page.goto('/plans');
    await expect(page.locator('.message')).toContainText('Showing built-in plan preview');
  });

  test('10. CTA buttons navigate or set mode correctly', async ({ page }) => {
    // Seed onboarding so user is logged in
    await seedOnboardingCompleted(page);
    
    // Start in Local mode
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('love-universe-app-mode', 'local');
    });

    // Log in locally
    await page.goto('/auth/login');
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');
    await page.locator('.login-btn').click();
    await page.waitForURL('**/universe');

    // Go to plans page
    await page.goto('/plans');

    // Click Local Mode button (should keep us on local and go to /universe)
    const localCta = page.locator('button.cta-btn--local');
    await localCta.click();
    await page.waitForURL('**/universe');
    
    const mode = await page.evaluate(() => localStorage.getItem('love-universe-app-mode'));
    expect(mode).toBe('local');

    // Go back to plans
    await page.goto('/plans');

    // Mock API offline for the next switch attempt
    await page.route('**/api/plans', route => route.abort());

    // Click API Mode button (should fail because offline)
    const apiCta = page.locator('button.cta-btn--api');
    await apiCta.click();

    // Verify offline message
    const errorAlert = page.locator('.error-message');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Backend is offline or unreachable');

    // Verify mode is still local
    const finalMode = await page.evaluate(() => localStorage.getItem('love-universe-app-mode'));
    expect(finalMode).toBe('local');
  });

  test('11. No horizontal overflow at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/plans');

    const overflowX = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflowX).toBe(false);
  });
});
