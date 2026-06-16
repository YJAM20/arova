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

test.describe('Arova Custom Sections E2E Smoke Tests', () => {
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

  test('should simulate tier configurations, CRUD custom spaces, and add checkable list items', async ({ page }) => {
    await page.goto('/custom-sections');
    await page.waitForURL('**/custom-sections');

    // Upgrade tier to Pro
    const proBtn = page.locator('button:has-text("Pro")');
    await expect(proBtn).toBeVisible();
    await proBtn.click();

    // Verify slots meter updated
    const meterLabel = page.locator('.usage-meter-card');
    await expect(meterLabel).toContainText('/ 5');

    // Create a new section
    const createBtn = page.locator('.btn-add-section');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // Fill form details
    await page.fill('input[name="newTitle"]', 'Inside Jokes');
    await page.fill('textarea[name="newDescription"]', 'Funny remarks we had in 2026.');
    
    const saveBtn = page.locator('.modal-card button[type="submit"]');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify section created in list
    const sectionItem = page.locator('.section-item:has-text("Inside Jokes")');
    await expect(sectionItem).toBeVisible();
    await sectionItem.click();

    // Add list items inside
    await page.fill('input[placeholder*="Add a new item"]', 'You are my favorite error code');
    const addItemBtn = page.locator('.btn-add-item');
    await expect(addItemBtn).toBeVisible();
    await addItemBtn.click();

    // Verify item is present in checkout list
    const entry = page.locator('.item-entry');
    await expect(entry).toBeVisible();
    await expect(entry).toContainText('You are my favorite error code');

    // Check item check box
    const checkbox = entry.locator('.checkbox-input');
    await expect(checkbox).toBeVisible();
    await checkbox.check();

    // Verify complete class line-through
    const contentText = entry.locator('.item-content');
    await expect(contentText).toHaveClass(/completed/);
  });
});
