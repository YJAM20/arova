import { test, expect, Page } from '@playwright/test';

async function openReasonsInLocalMode(page: Page, seedReasons: any[] = []): Promise<void> {
  await page.goto('/');
  await page.evaluate((reasons) => {
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
          {
            id: 'user-owner',
            username: 'owner',
            passcode: '1234',
            displayName: 'Partner A',
            role: 'admin',
          },
          {
            id: 'user-partner',
            username: 'partner',
            passcode: '1234',
            displayName: 'Partner B',
            role: 'partner',
          },
        ],
        memories: [],
        reasons: reasons,
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
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }, seedReasons);
  await page.goto('/reasons');
}

test.describe('Arova Reasons Flow', () => {
  test('loads route with heading, kicker, and empty state in Local Mode', async ({ page }) => {
    await openReasonsInLocalMode(page);

    // Kicker and Title checks
    await expect(page.getByRole('main').locator('.eyebrow').getByText('Reasons', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /reasons worth remembering/i })).toBeVisible();

    // Empty state heading & helper copy
    await expect(page.getByRole('heading', { name: /no reasons saved yet/i })).toBeVisible();
    await expect(page.getByText(/Start with one simple reason/i)).toBeVisible();

    // Add reason link
    await expect(page.locator('arova-page-header').getByRole('link', { name: /add reason/i })).toBeVisible();
  });

  test('displays seeded reasons cards, category filters, and supports detail navigation', async ({ page }) => {
    const reasons = [
      {
        id: 'rsn-1',
        title: 'Seeded Reason One',
        body: 'Seeded body description detailing first reason.',
        category: 'love',
        order: 1,
        isSecret: false,
        isFavorite: true,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: []
      },
      {
        id: 'rsn-2',
        title: 'Seeded Reason Two',
        body: 'Seeded body description detailing second reason.',
        category: 'trust',
        order: 2,
        isSecret: false,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: []
      }
    ];

    await openReasonsInLocalMode(page, reasons);

    // Grid displays reasons
    await expect(page.locator('.reasons-grid').getByRole('heading', { name: 'Seeded Reason One' })).toBeVisible();
    await expect(page.getByText('Seeded body description detailing second reason.')).toBeVisible();

    // Filter by Trust category
    await page.getByRole('button', { name: 'Trust', exact: true }).click();
    await expect(page.locator('.reasons-grid').getByRole('heading', { name: 'Seeded Reason One' })).not.toBeVisible();
    await expect(page.locator('.reasons-grid').getByRole('heading', { name: 'Seeded Reason Two' })).toBeVisible();

    // Click card and verify navigation to detail page
    await page.locator('.reasons-grid').getByRole('heading', { name: 'Seeded Reason Two' }).click();
    await page.waitForURL('**/reasons/rsn-2');
    expect(page.url()).toContain('/reasons/rsn-2');

    // Details check
    await expect(page.locator('.page-kicker')).toHaveText('Reason');
    await expect(page.locator('.reason-title')).toHaveText('Seeded Reason Two');
    await expect(page.locator('.metadata-grid')).toContainText('Trust');
    await expect(page.locator('.metadata-grid')).toContainText('Reason #2');
    await expect(page.locator('.main-copy')).toHaveText('Seeded body description detailing second reason.');
  });

  test('displays missing state for non-existent reason ID', async ({ page }) => {
    await openReasonsInLocalMode(page);
    await page.goto('/reasons/does-not-exist');

    // Alert details missing page templates
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('heading', { name: /we couldn’t find this reason/i })).toBeVisible();
    await expect(page.getByText(/it may have been removed, or it may not exist/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /return to reasons/i })).toBeVisible();
  });

  test('supports adding a new reason and saves it to local list', async ({ page }) => {
    await openReasonsInLocalMode(page);

    // Click Add Reason link
    await page.locator('arova-page-header').getByRole('link', { name: /add reason/i }).click();
    await page.waitForURL('**/reasons/new');

    // Form headers & custom labels check
    await expect(page.getByRole('heading', { name: 'Add a reason' })).toBeVisible();
    await expect(page.getByText('Write something honest and specific — a reason you may want to return to later.')).toBeVisible();
    await expect(page.locator('label[for="title"]')).toHaveText('Reason title');
    await expect(page.locator('label[for="body"]')).toHaveText('Reason body');
    await expect(page.locator('label[for="order"]')).toHaveText('Display order');

    // Fill form
    await page.locator('#title').fill('A Brand New Reason');
    await page.locator('#body').fill('I choose you because you make me feel safe.');
    await page.locator('#category').selectOption('choose-you');
    await page.locator('#order').fill('5');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Verifies navigation back to reasons list
    await page.waitForURL('**/reasons');

    // Verify item in list
    await expect(page.locator('.reasons-grid').getByRole('heading', { name: 'A Brand New Reason' })).toBeVisible();
  });

  test('supports editing an existing reason', async ({ page }) => {
    const reasons = [
      {
        id: 'rsn-edit-test',
        title: 'Original Reason Title',
        body: 'Original reason body.',
        category: 'love',
        order: 1,
        isSecret: false,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: []
      }
    ];
    await openReasonsInLocalMode(page, reasons);
    // Demote role to partner to keep edit flow in the public facing views
    await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem('love-universe-session-v1') || '{}');
      session.role = 'partner';
      localStorage.setItem('love-universe-session-v1', JSON.stringify(session));
    });
    await page.goto('/reasons/rsn-edit-test');

    // Click edit action
    await page.locator('.action-btn--edit').click();
    await page.waitForURL('**/reasons/rsn-edit-test/edit');

    // Verify edit form header copy
    await expect(page.getByRole('heading', { name: 'Refine this reason' })).toBeVisible();

    // Modify title and body
    await page.locator('#title').fill('Updated Reason Title');
    await page.locator('#body').fill('Updated reason body contents.');

    // Save changes
    await page.getByRole('button', { name: 'Save changes' }).click();

    // Navigates back to list
    await page.waitForURL('**/reasons');

    // Verify updated title
    await expect(page.locator('.reasons-grid').getByRole('heading', { name: 'Updated Reason Title' })).toBeVisible();
  });

  test('has no horizontal overflow at 320px viewport for reasons views', async ({ page }) => {
    const reasons = [
      {
        id: 'rsn-320',
        title: 'Title check for horizontal scroll safety',
        body: 'Reason body description for horizontal scroll checks.',
        category: 'love',
        order: 1,
        isSecret: false,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: []
      }
    ];

    await page.setViewportSize({ width: 320, height: 720 });
    await openReasonsInLocalMode(page, reasons);

    // List view check
    let hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    // Details view check
    await page.goto('/reasons/rsn-320');
    hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    // Edit form check
    await page.goto('/reasons/rsn-320/edit');
    hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
