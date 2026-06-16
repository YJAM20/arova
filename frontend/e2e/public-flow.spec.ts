import { test, expect } from '@playwright/test';

test.describe('Arova E2E Public Flow Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure a clean slate before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should load the landing page and display brand copy', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Arova');
    await expect(page.locator('.eyebrow')).toContainText('Arova — A private space for two.');
    await expect(page.locator('h2').first()).toContainText('A quiet place for everything you share.');
    await expect(page).toHaveURL('/');
  });

  test('should load plans page and list pricing plans', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.locator('h1')).toContainText('Plans for a shared space.');
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
});
