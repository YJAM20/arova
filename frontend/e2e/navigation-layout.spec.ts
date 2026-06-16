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

test.describe('Arova E2E Navigation & Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure a clean slate before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should NOT render sidebar for public and setup pages', async ({ page }) => {
    // Set a longer timeout to accommodate sequential slow connection failures on localhost
    test.setTimeout(60000);

    // 1. Landing Page
    await page.goto('/');
    await expect(page.locator('.sidebar')).toHaveCount(0);

    // 2. Plans Page
    await page.goto('/plans');
    await expect(page.locator('.sidebar')).toHaveCount(0);

    // 3. Gifted Plan Page
    await page.goto('/plans/gifted?plan=Pro');
    await expect(page.locator('.sidebar')).toHaveCount(0);

    // 4. Public Auth Page
    await page.goto('/auth');
    await expect(page.locator('.sidebar')).toHaveCount(0);

    // Mock the /api/auth/me API call to prevent token validation failure/redirect
    await page.route('**/api/auth/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'dummy-id', displayName: 'Dummy User', email: 'dummy@example.com' }),
      });
    });

    // Inject dummy token and API mode to test setup pages without unauthenticated redirects
    await page.evaluate(() => {
      localStorage.setItem('love-universe-app-mode', 'api');
      localStorage.setItem('love-universe-api-token', 'dummy-token');
    });

    // 5. Verify Account Page
    await page.goto('/verify-account', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/verify-account');
    await expect(page.locator('.sidebar')).toHaveCount(0);

    // 6. Onboarding Questions Page
    await page.goto('/onboarding/questions', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/onboarding/questions');
    await expect(page.locator('.sidebar')).toHaveCount(0);

    // 7. Profile Setup Page
    await page.goto('/profile-setup', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/profile-setup');
    await expect(page.locator('.sidebar')).toHaveCount(0);

    // 8. Pairing Choice Page
    await page.goto('/pairing-choice', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/pairing-choice');
    await expect(page.locator('.sidebar')).toHaveCount(0);
  });

  test('should render sidebar for internal universe dashboard pages', async ({ page }) => {
    // Seed completed onboarding first at '/'
    await page.goto('/');
    await seedOnboardingCompleted(page);

    // Log in using local demo to bypass setup pages and access universe
    await page.goto('/auth/login');
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');
    await page.locator('.login-btn').click();
    await page.waitForURL('**/universe');

    const internalRoutes = [
      '/universe',
      '/memories',
      '/reasons',
      '/letters',
      '/settings',
      '/chat'
    ];

    for (const route of internalRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForURL(`**${route}`);
      // Assert that the sidebar is visible
      const sidebar = page.locator('.sidebar');
      await expect(sidebar).toBeVisible();
    }
  });
});
