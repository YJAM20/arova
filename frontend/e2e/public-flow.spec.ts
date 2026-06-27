import { test, expect } from '@playwright/test';

test.describe('Arova E2E Public Flow Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure a clean slate before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should load the landing page and display brand copy, background video, and CTA', async ({ page }) => {
    await page.goto('/');
    
    // Check Arova brand wordmark is visible
    await expect(page.locator('.nav-brand')).toContainText('Arova');

    // Check H1 is visible and contains expected copywriting
    await expect(page.getByRole('heading', { name: /private universe for two|quiet space/i })).toBeVisible();

    // Check background video exists and is muted
    const video = page.locator('video.hero-video');
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('preload', 'metadata');

    // Check local mode credentials text is visible
    await expect(page.getByText(/owner \/ 1234/i)).toBeVisible();

    // Check CTA button exists and navigates to /auth
    const ctaBtn = page.getByRole('link', { name: /start with arova/i });
    await expect(ctaBtn).toBeVisible();
    await ctaBtn.click();
    await page.waitForURL('**/auth');
    await expect(page).toHaveURL(/\/auth$/);
  });

  test('should support mobile viewport and have no horizontal overflow', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');

    // Scroll landing container should be visible
    await expect(page.locator('.scroll-landing')).toBeVisible();

    // Verify no horizontal overflow by checking scrollWidth equals clientWidth on root element
    const overflowX = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflowX).toBe(false);
  });

  test('should load plans page and list pricing plans', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.locator('h1')).toContainText('Choose how your universe runs');
    await expect(page.locator('.plan-card')).toHaveCount(3);
    await expect(page.locator('.plan-card').nth(0)).toContainText('Free');
    await expect(page.locator('.plan-card').nth(1)).toContainText('Pro');
    await expect(page.locator('.plan-card').nth(2)).toContainText('Platinum');
  });

  test('should load gifted plan page without checkout form and show authentication warning', async ({ page }) => {
    await page.goto('/plans/gifted?plan=Pro');
    await expect(page.locator('h1')).toContainText('This one is on us.');
    await expect(page.locator('.gifted-page')).toBeVisible();

    // Verify there are no credit card or checkout fields
    await expect(page.locator('input[type="card"]')).toHaveCount(0);
    await expect(page.locator('input[placeholder*="Card"]')).toHaveCount(0);
    await expect(page.locator('input[placeholder*="CVV"]')).toHaveCount(0);

    // Click "Continue with Pro" button when unauthenticated
    const continueBtn = page.getByRole('button', { name: 'Continue with Pro' });
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Verify authentication error message
    const errorMsg = page.locator('.error');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Please sign in or register an account before applying the gifted upgrade.');
  });

  test('should redirect unauthenticated users to /auth when visiting protected routes', async ({ page }) => {
    const protectedRoutes = [
      '/verify-account',
      '/onboarding/questions',
      '/profile-setup',
      '/pairing-choice',
      '/universe',
      '/memories',
      '/reasons',
      '/letters',
      '/settings',
      '/chat'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL('**/auth');
      await expect(page).toHaveURL(/\/auth$/);
    }
  });

  test('should load auth page layout, switch tabs, check local demo CTA and providers warnings', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForURL('**/auth');

    // 1. Cinematic left panel content
    const heading = page.locator('h1', { hasText: 'A private space for two.' });
    await expect(heading).toBeVisible();

    // 2. Tab checks
    const loginTab = page.getByRole('tab', { name: /Sign In/i });
    const registerTab = page.getByRole('tab', { name: /Create Account/i });
    await expect(loginTab).toBeVisible();
    await expect(registerTab).toBeVisible();
    
    // Login active by default
    await expect(loginTab).toHaveAttribute('aria-selected', 'true');
    await expect(registerTab).toHaveAttribute('aria-selected', 'false');

    // Check login fields
    await expect(page.locator('input[name="usernameOrEmail"]')).toBeVisible();
    await expect(page.locator('input[name="loginPassword"]')).toBeVisible();

    // 3. Switch to Register tab
    await registerTab.click();
    await expect(registerTab).toHaveAttribute('aria-selected', 'true');
    await expect(loginTab).toHaveAttribute('aria-selected', 'false');

    // Check register fields are visible
    await expect(page.locator('input[name="displayName"]')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();

    // 4. Local demo link exists
    const demoLink = page.getByRole('link', { name: /Continue with local demo/i });
    await expect(demoLink).toBeVisible();

    // 5. OAuth warning message triggers
    const googleBtn = page.getByRole('button', { name: /Continue with Google/i });
    await expect(googleBtn).toBeVisible();
    await googleBtn.click();
    const providerMessage = page.locator('.message');
    await expect(providerMessage).toBeVisible();
    await expect(providerMessage).toContainText('Google is prepared but not configured in this environment yet.');
  });

  test('should display particles canvas, scroll-reveal product cards, and final Arova v2 section', async ({ page }) => {
    await page.goto('/');

    // 1. Check canvas exists
    const canvas = page.locator('canvas.particles-canvas');
    await expect(canvas).toBeAttached();

    // 2. Check product cards exist in the DOM
    const cards = page.locator('.product-card');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText('Memories that stay close');
    await expect(cards.nth(1)).toContainText('Private letters and moods');
    await expect(cards.nth(2)).toContainText('Local demo, API-ready path');

    // 3. Check final reveal section exists and transitions to visible on scroll
    const finalSection = page.locator('.final-reveal-section');
    await expect(finalSection).toBeAttached();
    await expect(finalSection).toContainText('Arova v2');

    // Scroll down to final section to trigger visibility observer
    await finalSection.scrollIntoViewIfNeeded();
    await expect(finalSection).toHaveClass(/visible/);
  });

  test('should display plans comparison table and disclaimer on plans page', async ({ page }) => {
    await page.goto('/plans');

    // 1. Comparison table assertions
    const comparisonSection = page.locator('.comparison-section');
    await expect(comparisonSection).toBeVisible();
    await expect(comparisonSection.locator('h2')).toContainText('Feature Matrix');

    const table = comparisonSection.locator('.comparison-table');
    await expect(table).toBeVisible();

    // Check headers Feature, Local Mode, API Mode
    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(3);
    await expect(headers.nth(1)).toContainText('Local Mode');
    await expect(headers.nth(2)).toContainText('API Mode');

    // Check rows count
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(9);

    // Check disclaimer is displayed
    const disclaimer = comparisonSection.locator('.table-disclaimer');
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer.locator('.disclaimer-text')).toContainText(
      'Real payments are not processed in this demo'
    );
  });

  test('should display feature highlights row with correct copy and details', async ({ page }) => {
    await page.goto('/');

    // Check highlight row is visible
    const highlightRow = page.locator('.feature-highlights-row');
    await expect(highlightRow).toBeVisible();

    // Check highlights are present
    const cards = highlightRow.locator('.highlight-card');
    await expect(cards).toHaveCount(4);

    await expect(page.locator('#landing-feature-private')).toContainText('Private by design');
    await expect(page.locator('#landing-feature-private')).toContainText('couple-only');

    await expect(page.locator('#landing-feature-realtime')).toContainText('Realtime-ready');
    await expect(page.locator('#landing-feature-realtime')).toContainText('API Mode');

    await expect(page.locator('#landing-feature-languages')).toContainText('EN / AR / ES');
    await expect(page.locator('#landing-feature-languages')).toContainText('RTL');

    await expect(page.locator('#landing-feature-local')).toContainText('Local-first demo');
    await expect(page.locator('#landing-feature-local')).toContainText('without backend');

    // Ensure no false production E2EE/OAuth/SMS claims exist
    const pageContent = await page.content();
    expect(pageContent).not.toMatch(/true end-to-end encryption is (enabled|active|complete)/i);
  });
});
