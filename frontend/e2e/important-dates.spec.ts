import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

async function openImportantDatesInLocalMode(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => {
    const today = new Date();
    
    // date 1: 5 days from now
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 5);
    const date1Str = d1.getFullYear() + '-' + String(d1.getMonth() + 1).padStart(2, '0') + '-' + String(d1.getDate()).padStart(2, '0');

    // date 2: 20 days from now
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 20);
    const date2Str = d2.getFullYear() + '-' + String(d2.getMonth() + 1).padStart(2, '0') + '-' + String(d2.getDate()).padStart(2, '0');

    localStorage.clear();
    localStorage.setItem('love-universe-app-mode', 'local');
    localStorage.setItem(
      'love-universe-session-v1',
      JSON.stringify({
        id: 'user-owner',
        username: 'owner',
        passcode: '1234',
        displayName: 'Partner A',
        role: 'admin',
      })
    );
    localStorage.setItem(
      'love-universe-data-v1',
      JSON.stringify({
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
          { id: 'user-partner', username: 'partner', passcode: '1234', displayName: 'Partner B', role: 'partner' },
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
        importantDates: [
          {
            id: 'imp-test-1',
            coupleId: 'couple-default',
            createdByUserId: 'user-owner',
            title: 'Test Anniversary',
            description: 'Anniversary description note.',
            date: date1Str,
            type: 'anniversary',
            recurrence: 'yearly',
            reminderEnabled: true,
            reminderDaysBefore: 5,
            isPrivate: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'imp-test-2',
            coupleId: 'couple-default',
            createdByUserId: 'user-owner',
            title: 'Test Private Birthday',
            description: 'Top secret wishlist details.',
            date: date2Str,
            type: 'birthday',
            recurrence: 'yearly',
            reminderEnabled: false,
            reminderDaysBefore: 1,
            isPrivate: true,
            createdAt: new Date().toISOString(),
          }
        ],
        coupleProfile: {
          coupleSpaceName: 'Arova Space',
          partnerADisplayName: 'Partner A',
          partnerBDisplayName: 'Partner B',
          updatedAt: new Date().toISOString(),
        },
      })
    );
  });
  await page.goto('/important-dates');
}

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────

test.describe('Arova Important Dates & Milestones Page Flow', () => {
  test('loads route with eyebrow and header in Local Mode', async ({ page }) => {
    await openImportantDatesInLocalMode(page);

    await expect(page.locator('.eyebrow')).toContainText(/universe space/i);
    await expect(page.getByRole('heading', { name: /milestones & reminders/i })).toBeVisible();
  });

  test('renders upcoming hero countdown banner correctly', async ({ page }) => {
    await openImportantDatesInLocalMode(page);

    // Hero card should be visible
    const heroCard = page.locator('.hero-card');
    await expect(heroCard).toBeVisible();

    // Verify title and days remaining displays
    await expect(heroCard.locator('.hero-title')).toContainText(/Test Anniversary/i);
    await expect(heroCard.locator('.days-num')).toBeVisible();
    await expect(heroCard.locator('.days-label')).toContainText(/days remaining/i);
  });

  test('can filter dates using category chips', async ({ page }) => {
    await openImportantDatesInLocalMode(page);

    // Initial state: both dates should be visible
    await expect(page.locator('.date-card')).toHaveCount(2);

    // Click Anniversary filter chip
    await page.locator('button.filter-chip').filter({ hasText: 'Anniversary' }).click();
    await expect(page.locator('.date-card')).toHaveCount(1);
    await expect(page.locator('.card-title')).toContainText(/Test Anniversary/i);

    // Click Birthday filter chip
    await page.locator('button.filter-chip').filter({ hasText: 'Birthday' }).click();
    await expect(page.locator('.date-card')).toHaveCount(1);
    await expect(page.locator('.card-title')).toContainText(/Test Private Birthday/i);

    // Click All chip
    await page.locator('button.filter-chip').filter({ hasText: 'All Milestones' }).click();
    await expect(page.locator('.date-card')).toHaveCount(2);
  });

  test('can record a new milestone', async ({ page }) => {
    await openImportantDatesInLocalMode(page);

    // Click New Milestone button to open form
    await page.locator('#toggle-add-form').click();
    await expect(page.locator('#important-date-form')).toBeVisible();

    // Fill form
    await page.locator('#date-title').fill('First Meeting');
    await page.locator('#date-description').fill('Where we met.');
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const dateStr = futureDate.toISOString().slice(0, 10);
    await page.locator('#date-value').fill(dateStr);
    await page.locator('#date-type').selectOption('first-moment');
    await page.locator('#date-recurrence').selectOption('none');
    await page.locator('#date-reminder-days').fill('3');
    
    // Toggle checkbox
    await page.locator('label:has-text("Keep this private")').click();

    // Submit
    await page.locator('#date-submit-btn').click();

    // Verify success banner and card addition
    await expect(page.locator('#date-save-success')).toBeVisible();
    await expect(page.locator('.date-card')).toHaveCount(3);
    
    // Switch filter to verify
    await page.locator('button.filter-chip').filter({ hasText: 'First Moment' }).click();
    await expect(page.locator('.date-card')).toHaveCount(1);
    await expect(page.locator('.card-title')).toContainText(/First Meeting/i);
  });

  test('can edit an existing milestone', async ({ page }) => {
    await openImportantDatesInLocalMode(page);

    // Locate the first date card edit button and click it
    const editBtn = page.locator('#edit-date-imp-test-1');
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Form drawer should open filled with details
    await expect(page.locator('#important-date-form')).toBeVisible();
    const titleInput = page.locator('#date-title');
    await expect(titleInput).toHaveValue('Test Anniversary');

    // Update title
    await titleInput.fill('Updated Test Anniversary');
    await page.locator('#date-submit-btn').click();

    // Verify success and updated UI
    await expect(page.locator('#date-save-success')).toBeVisible();
    await expect(page.locator('#date-card-imp-test-1 .card-title')).toContainText('Updated Test Anniversary');
  });

  test('can delete an existing milestone', async ({ page }) => {
    await openImportantDatesInLocalMode(page);

    // Set page dialog handler for confirmation popup
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to delete');
      await dialog.accept();
    });

    // Locate delete button and click
    const deleteBtn = page.locator('#delete-date-imp-test-2');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Verify card is removed from grid
    await expect(page.locator('.date-card')).toHaveCount(1);
    await expect(page.locator('#date-card-imp-test-2')).not.toBeVisible();
  });

  test('milestones preview displays on universe dashboard home', async ({ page }) => {
    // Navigate to homepage after loading local mode data
    await openImportantDatesInLocalMode(page);
    await page.goto('/universe');

    // Verify dashboard card is visible and populated
    const milestoneCard = page.locator('#milestones-dashboard-card');
    await expect(milestoneCard).toBeVisible();
    await expect(milestoneCard.locator('.milestone-title-text')).toContainText(/Test Anniversary/i);
    await expect(milestoneCard.locator('#milestone-days-remaining')).toBeVisible();
  });

  test('has no horizontal scroll overflow at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openImportantDatesInLocalMode(page);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
