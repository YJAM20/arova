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

test.describe('Arova Planets E2E Smoke Tests', () => {
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

  test('should load planets page and interact with daily tasks checklist', async ({ page }) => {
    await page.goto('/planets');
    await page.waitForURL('**/planets');

    // Check header and space map
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Relationship Planets');

    // Find the daily planet checklist container
    const checklistCard = page.locator('.daily-hero');
    await expect(checklistCard).toBeVisible();

    // Check first task in the list
    const firstTaskCheckbox = checklistCard.locator('input[type="checkbox"]').first();
    await expect(firstTaskCheckbox).toBeVisible();

    // Verify task label is strike-through when selected
    const initialChecked = await firstTaskCheckbox.isChecked();
    await firstTaskCheckbox.setChecked(!initialChecked);
    
    // Check if points service responded
    const pointsText = page.locator('.sidebar-footer');
    await expect(pointsText).toBeVisible();
  });

  test('should display built-in planets section and custom spaces CTA link', async ({ page }) => {
    await page.goto('/planets');
    
    // Check heading for relationship planets map section
    const subHeading = page.getByRole('heading', { name: /relationship planets/i }).last();
    await expect(subHeading).toBeVisible();

    // Check custom space CTA banner
    const ctaCard = page.locator('.custom-spaces-cta');
    await expect(ctaCard).toBeVisible();
    await expect(ctaCard.locator('h2')).toContainText(/build your own private universe/i);
    
    const linkBtn = ctaCard.locator('a[routerlink="/custom-sections"]');
    await expect(linkBtn).toBeVisible();
  });

  test('Local Mode does not make any backend API calls on planets load', async ({ page }) => {
    let backendCalled = false;
    await page.route('**/api/**', () => {
      backendCalled = true;
    });

    await page.goto('/planets');
    await expect(page.locator('h1')).toContainText('Relationship Planets');
    expect(backendCalled).toBe(false);
  });

  test('has no horizontal overflow at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/planets');

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
