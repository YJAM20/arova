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

test.describe('Arova E2E Local Mode Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and seed completed onboarding
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await seedOnboardingCompleted(page);
  });

  test('should log in using owner local demo credentials', async ({ page }) => {
    // Navigate to auth route
    await page.goto('/auth');

    // Click on "Continue with local demo"
    const localDemoLink = page.locator('.local-demo');
    await expect(localDemoLink).toBeVisible();
    await localDemoLink.click();

    // Verify it navigates to /auth/login
    await page.waitForURL('**/auth/login');
    await expect(page).toHaveURL(/\/auth\/login$/);

    // Enter owner credentials
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');

    // Submit form
    const submitBtn = page.locator('.login-btn');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify redirect to /universe
    await page.waitForURL('**/universe');
    await expect(page).toHaveURL(/\/universe$/);

    // Verify layout sidebar is present
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();

    // Verify welcome message for owner (role admin)
    const welcomeHeading = page.locator('.hero-title');
    await expect(welcomeHeading).toBeVisible();
    await expect(welcomeHeading).toContainText('Welcome back, Partner A.');

    // Test sidebar links navigation:
    // Memories
    await page.goto('/memories');
    await page.waitForURL('**/memories');
    await expect(page.locator('.sidebar')).toBeVisible();

    // Reasons
    await page.goto('/reasons');
    await page.waitForURL('**/reasons');
    await expect(page.locator('.sidebar')).toBeVisible();

    // Letters
    await page.goto('/letters');
    await page.waitForURL('**/letters');
    await expect(page.locator('.sidebar')).toBeVisible();

    // Chat
    await page.goto('/chat');
    await page.waitForURL('**/chat');
    await expect(page.locator('.sidebar')).toBeVisible();

    // Settings
    await page.goto('/settings');
    await page.waitForURL('**/settings');
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('should log in using partner local demo credentials', async ({ page }) => {
    await page.goto('/auth/login');

    // Enter partner credentials
    await page.fill('#username', 'partner');
    await page.fill('#passcode', '1234');

    const submitBtn = page.locator('.login-btn');
    await submitBtn.click();

    await page.waitForURL('**/universe');
    await expect(page).toHaveURL(/\/universe$/);

    // Verify welcome message for partner
    const welcomeHeading = page.locator('.hero-title');
    await expect(welcomeHeading).toBeVisible();
    await expect(welcomeHeading).toContainText('Welcome back, Partner B.');
  });

  test('should allow theme selection and persist it in local mode settings', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');
    await page.locator('.login-btn').click();
    await page.waitForURL('**/universe');

    // Navigate to settings page
    await page.goto('/settings');
    await page.waitForURL('**/settings');

    // Hover over elements to trigger tooltips
    const helpBtn = page.locator('button:has-text("Help Info")');
    await helpBtn.hover();
    await expect(page.locator('text="Get support and view Arova documentation"')).toBeVisible();

    const saveBtn = page.locator('button:has-text("Quick Save")');
    await saveBtn.hover();
    await expect(page.locator('text="Click to persist preferences to browser storage"')).toBeVisible();

    // Click on the Appearance tab
    await page.click('button.tab-nav-btn:has-text("Appearance")');

    // Select the 'soft-pink' theme option
    await page.click('button.theme-select-btn:has(.swatch-soft-pink)');

    // Submit settings form
    await page.locator('button[type="submit"]').click();

    // Verify confirmation message
    const message = page.locator('.success-message');
    await expect(message).toBeVisible();

    // Verify toast notification
    await expect(page.locator('text="Changes saved successfully!"')).toBeVisible();
    await expect(page.locator('text="Your preferences have been updated."')).toBeVisible();

    // Verify the root html element has the theme class added
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/theme-soft-pink/);

    // Reload the page and verify persistence
    await page.reload();
    await expect(htmlElement).toHaveClass(/theme-soft-pink/);
  });
});
