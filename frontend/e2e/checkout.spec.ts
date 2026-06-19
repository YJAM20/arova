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

test.describe('Arova E2E Sandbox Checkout Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start with a clean slate
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display active plans on plans page and support checkout navigation', async ({ page }) => {
    await page.goto('/plans');
    
    // Check main title
    await expect(page.locator('h1')).toContainText('Plans for a shared space.');

    // Find and check CTA button links for monthly subscriptions
    const proMonthlyBtn = page.locator('a.cta-btn--monthly', { hasText: 'Get Pro Monthly' });
    await expect(proMonthlyBtn).toBeVisible();
    await expect(proMonthlyBtn).toHaveAttribute('href', /\/checkout\?plan=pro&period=monthly/);

    const platinumYearlyBtn = page.locator('a.cta-btn--yearly', { hasText: 'Get Platinum Yearly (Demo)' });
    await expect(platinumYearlyBtn).toBeVisible();
    await expect(platinumYearlyBtn).toHaveAttribute('href', /\/checkout\?plan=platinum&period=yearly/);
  });

  test('should show error warning if checkout is accessed with invalid parameters', async ({ page }) => {
    // Access directly without parameters
    await page.goto('/checkout');
    await expect(page.locator('.invalid-summary')).toBeVisible();
    await expect(page.locator('.invalid-summary')).toContainText('Invalid checkout query parameters');

    // Access with completely wrong parameter values
    await page.goto('/checkout?plan=invalid&period=monthly');
    await expect(page.locator('.invalid-summary')).toBeVisible();
    await expect(page.locator('.invalid-summary')).toContainText('Invalid checkout query parameters');
  });

  test('should parse checkout parameters and load plans details with sandbox disclaimers', async ({ page }) => {
    await page.goto('/checkout?plan=pro&period=monthly');

    // Verify plan details parsed from query parameters
    await expect(page.locator('.plan-summary-box')).toBeVisible();
    await expect(page.locator('.plan-summary-box')).toContainText('Pro Plan');
    await expect(page.locator('.plan-summary-box')).toContainText('Monthly');
    await expect(page.locator('.plan-summary-box')).toContainText('$10 / month');

    // Verify warnings panel and disclaimer presence
    await expect(page.locator('.sandbox-disclaimer')).toBeVisible();
    await expect(page.locator('.sandbox-disclaimer')).toContainText('This checkout runs in Paddle Sandbox');

    // Verify action buttons
    await expect(page.locator('button.checkout-btn--paddle')).toBeVisible();
    await expect(page.locator('button.checkout-btn--simulate')).toBeVisible();
  });

  test('should simulate a successful checkout upgrade and verify settings plan status', async ({ page }) => {
    // 1. Seed completed onboarding so settings page can be loaded after login
    await seedOnboardingCompleted(page);

    // 2. Perform mock login to store auth session
    await page.goto('/auth/login');
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');
    await page.locator('.login-btn').click();
    await page.waitForURL('**/universe');

    // 3. Navigate to checkout and simulate purchase
    await page.goto('/checkout?plan=pro&period=monthly');
    const simulateBtn = page.locator('button.checkout-btn--simulate');
    await expect(simulateBtn).toBeVisible();
    await simulateBtn.click();

    // 4. Verify redirected to success page
    await page.waitForURL('**/checkout/success');
    await expect(page.locator('h1')).toContainText('Demo checkout complete');
    await expect(page.locator('.plan-details-box')).toContainText('Pro Plan');
    await expect(page.locator('.provisioning-warning')).toBeVisible();

    // 5. Verify local storage has pricing tier updated
    const tier = await page.evaluate(() => localStorage.getItem('arova-user-tier-v1'));
    expect(tier).toBe('pro');

    // 6. Go to Settings and verify active plan display
    await page.goto('/settings');
    await page.waitForURL('**/settings');

    // Click "Partner & Profile" tab (usually 'account')
    await page.click('button.tab-nav-btn:has-text("Partner & Profile")');
    await expect(page.locator('section[aria-labelledby="plan-heading"]')).toBeVisible();
    await expect(page.locator('section[aria-labelledby="plan-heading"]')).toContainText('Current Plan: PRO');
  });

  test('should navigate back to plans if cancel is clicked', async ({ page }) => {
    await page.goto('/checkout?plan=pro&period=monthly');
    const backBtn = page.locator('a.checkout-btn--cancel');
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await page.waitForURL('**/plans');
    await expect(page).toHaveURL(/\/plans$/);
  });

  test('should load the cancel checkout landing page properly', async ({ page }) => {
    await page.goto('/checkout/cancel');
    await expect(page.locator('h1')).toContainText('Checkout canceled');
    await expect(page.locator('.info-details-box')).toContainText('You can return to the plans catalogue');
  });

  test('should fit inside mobile viewport without horizontal overflows', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/checkout?plan=pro&period=monthly');

    // Verify container visibility
    await expect(page.locator('.checkout-card')).toBeVisible();

    // Verify no horizontal overflow
    const overflowX = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflowX).toBe(false);
  });
});
