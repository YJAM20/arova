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
      memories: [
        { id: 'mem-1', title: 'First Date', description: 'Lovely dinner at the rooftop', date: '2026-01-01', category: 'romantic', visibleToPartner: true, isFavorite: false }
      ],
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

test.describe('Arova Profile E2E Smoke Tests', () => {
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

  test('should load profile page, check stats, open edit drawer, change name, and verify sidebar changes', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForURL('**/profile');

    // Verify Display Name exists
    const displayName = page.locator('.display-name');
    await expect(displayName).toBeVisible();
    await expect(displayName).toContainText('Partner A');

    // Verify stats counts
    const statMemories = page.locator('.stats-card .stat-box').first();
    await expect(statMemories).toContainText('1');

    // Click on Edit Profile
    const editBtn = page.locator('.btn-edit');
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Fill new display name
    const inputName = page.locator('input[name="displayName"]');
    await expect(inputName).toBeVisible();
    await inputName.fill('Super Partner A');

    // Submit edit form
    const saveBtn = page.locator('button[type="submit"]');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify profile updated text changes
    await expect(displayName).toContainText('Super Partner A');

    // Check if sidebar header updated immediately to "Super Partner A"
    const sidebarName = page.locator('.sidebar .user-name');
    await expect(sidebarName).toContainText('Super Partner A');
  });

  test('should preview memory detail from the Instagram grid when clicked', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForURL('**/profile');

    // Click the photo card in grid
    const gridItem = page.locator('.grid-item').first();
    await expect(gridItem).toBeVisible();
    await gridItem.click();

    // Verify preview modal is open
    const modalHeading = page.locator('.memory-modal-card h2');
    await expect(modalHeading).toBeVisible();
    await expect(modalHeading).toContainText('First Date');
  });
});
