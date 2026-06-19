import { test, expect, Page } from '@playwright/test';

async function openLettersInLocalMode(page: Page, seedLetters: any[] = []): Promise<void> {
  await page.goto('/');
  await page.evaluate((letters) => {
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
        reasons: [],
        letters: letters,
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
  }, seedLetters);
  await page.goto('/letters');
}

test.describe('Arova Letters Flow', () => {
  test('loads letters vault with eyebrow, title, and empty state in Local Mode', async ({ page }) => {
    await openLettersInLocalMode(page);

    // Kicker and Title checks
    await expect(page.getByText('The Letters Vault', { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: /words sealed with love/i })).toBeVisible();

    // Empty state heading & description
    await expect(page.getByRole('heading', { name: /the vault is empty/i })).toBeVisible();
    await expect(page.getByText(/Write a letter to your partner/i)).toBeVisible();

    // Add letter link
    await expect(page.locator('arova-page-header').getByRole('link', { name: /add letter/i })).toBeVisible();
  });

  test('displays seeded letters cards, category filtering, and supports details navigation', async ({ page }) => {
    const letters = [
      {
        id: 'ltr-1',
        title: 'Miss Me Letter',
        body: 'This is the body of the miss me letter.',
        category: 'miss-me',
        isLocked: false,
        isFavorite: true,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibleToPartner: true,
      },
      {
        id: 'ltr-2',
        title: 'Birthday Letter',
        body: 'Happy birthday to you, partner.',
        category: 'birthday',
        isLocked: false,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibleToPartner: true,
      }
    ];

    await openLettersInLocalMode(page, letters);

    // Envelopes are displayed in the list
    await expect(page.locator('.letters-grid').getByRole('heading', { name: 'Miss Me Letter' })).toBeVisible();
    await expect(page.locator('.letters-grid').getByRole('heading', { name: 'Birthday Letter' })).toBeVisible();

    // Category Filter tab check
    await page.getByRole('button', { name: 'Birthday', exact: true }).click();
    await expect(page.locator('.letters-grid').getByRole('heading', { name: 'Miss Me Letter' })).not.toBeVisible();
    await expect(page.locator('.letters-grid').getByRole('heading', { name: 'Birthday Letter' })).toBeVisible();

    // Click card and verify navigation to detail page
    await page.locator('.letters-grid').getByRole('heading', { name: 'Birthday Letter' }).click();
    await page.waitForURL('**/letters/ltr-2');
    expect(page.url()).toContain('/letters/ltr-2');

    // Details check
    await expect(page.locator('.letter-details-title')).toHaveText('Birthday Letter');
    await expect(page.locator('.category-badge')).toHaveText('Birthday');
    await expect(page.locator('.letter-paper')).toContainText('Happy birthday to you, partner.');
  });

  test('displays passcode form on locked letters and unlocks with correct passcode', async ({ page }) => {
    const letters = [
      {
        id: 'ltr-locked',
        title: 'Locked Passcode Letter',
        body: 'Unlocked secret message.',
        category: 'reassurance',
        isLocked: true,
        passcode: 'love4ever',
        isFavorite: false,
        createdBy: 'user-partner', // written by partner
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibleToPartner: true,
      }
    ];

    await openLettersInLocalMode(page, letters);

    // Demote user role to partner (so they aren't admin and letter is locked for them)
    await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem('love-universe-session-v1') || '{}');
      session.role = 'partner';
      localStorage.setItem('love-universe-session-v1', JSON.stringify(session));
    });

    await page.goto('/letters/ltr-locked');

    // Check that lock screen is displayed
    await expect(page.getByRole('heading', { name: /sealed letter/i })).toBeVisible();
    await expect(page.getByText(/this letter is protected by a passcode/i)).toBeVisible();
    await expect(page.locator('#passcode-input')).toBeVisible();

    // Try incorrect passcode
    await page.locator('#passcode-input').fill('wrongpass');
    await page.getByRole('button', { name: /unlock/i }).click();
    await expect(page.locator('.passcode-error')).toHaveText(/the key does not fit/i);

    // Enter correct passcode
    await page.locator('#passcode-input').fill('love4ever');
    await page.getByRole('button', { name: /unlock/i }).click();

    // Check letter is unlocked and content is visible
    await expect(page.locator('.letter-paper')).toContainText('Unlocked secret message.');
    await expect(page.locator('.locked-panel')).not.toBeVisible();
  });

  test('automatically unlocks locked letter if unlock date has passed', async ({ page }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const letters = [
      {
        id: 'ltr-past-date',
        title: 'Past Date Letter',
        body: 'Unlocked past date message.',
        category: 'future',
        isLocked: true,
        unlockDate: yesterdayStr,
        isFavorite: false,
        createdBy: 'user-partner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibleToPartner: true,
      }
    ];

    await openLettersInLocalMode(page, letters);

    // Demote user role to partner
    await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem('love-universe-session-v1') || '{}');
      session.role = 'partner';
      localStorage.setItem('love-universe-session-v1', JSON.stringify(session));
    });

    await page.goto('/letters/ltr-past-date');

    // Verify it automatically displays paper sheet with content directly
    await expect(page.locator('.letter-paper')).toContainText('Unlocked past date message.');
    await expect(page.locator('.locked-panel')).not.toBeVisible();
  });

  test('displays sealed screen if unlock date is in the future', async ({ page }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const letters = [
      {
        id: 'ltr-future-date',
        title: 'Future Date Letter',
        body: 'Locked message.',
        category: 'future',
        isLocked: true,
        unlockDate: tomorrowStr,
        isFavorite: false,
        createdBy: 'user-partner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibleToPartner: true,
      }
    ];

    await openLettersInLocalMode(page, letters);

    // Demote user role to partner
    await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem('love-universe-session-v1') || '{}');
      session.role = 'partner';
      localStorage.setItem('love-universe-session-v1', JSON.stringify(session));
    });

    await page.goto('/letters/ltr-future-date');

    // Verify sealed screen with unlock date
    await expect(page.getByRole('heading', { name: /sealed letter/i })).toBeVisible();
    await expect(page.getByText(/this letter is sealed until/i)).toBeVisible();
    await expect(page.locator('.letter-paper')).not.toBeVisible();
  });

  test('supports adding a new letter and saves it to local vault', async ({ page }) => {
    await openLettersInLocalMode(page);

    // Click Add Letter link
    await page.locator('arova-page-header').getByRole('link', { name: /add letter/i }).click();
    await page.waitForURL('**/letters/new');

    // Form headers & checks
    await expect(page.getByRole('heading', { name: 'Write a letter for later' })).toBeVisible();
    await expect(page.locator('label[for="title"]')).toHaveText('Letter title');
    await expect(page.locator('label[for="body"]')).toHaveText('Letter body');

    // Fill form
    await page.locator('#title').fill('A Letter of Reassurance');
    await page.locator('#body').fill('Even when things get busy, I am always here.');
    await page.locator('#category').selectOption('reassurance');
    await page.locator('#passcode').fill('mykey123');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Verifies navigation back to letters vault
    await page.waitForURL('**/letters');

    // Verify item in list
    await expect(page.locator('.letters-grid').getByRole('heading', { name: 'A Letter of Reassurance' })).toBeVisible();
  });

  test('supports editing and deleting an existing letter', async ({ page }) => {
    const letters = [
      {
        id: 'ltr-edit-test',
        title: 'Original Title',
        body: 'Original content.',
        category: 'sad',
        isLocked: false,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibleToPartner: true,
      }
    ];

    await openLettersInLocalMode(page, letters);
    // Demote role to partner to keep edit flow in the public facing views
    await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem('love-universe-session-v1') || '{}');
      session.role = 'partner';
      localStorage.setItem('love-universe-session-v1', JSON.stringify(session));
    });
    await page.goto('/letters/ltr-edit-test');

    // Click edit action
    await page.locator('#edit-letter-link').click();
    await page.waitForURL('**/letters/ltr-edit-test/edit');

    // Verify edit form header copy
    await expect(page.getByRole('heading', { name: 'Update this letter' })).toBeVisible();

    // Modify title
    await page.locator('#title').fill('Updated Title');
    await page.getByRole('button', { name: 'Save this letter' }).click();

    // Navigates back to list
    await page.waitForURL('**/letters');

    // Verify updated title
    await expect(page.locator('.letters-grid').getByRole('heading', { name: 'Updated Title' })).toBeVisible();

    // Navigate to details again to test delete
    await page.locator('.letters-grid').getByRole('heading', { name: 'Updated Title' }).click();
    await page.waitForURL('**/letters/ltr-edit-test');

    // Handle confirm dialog for delete
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Delete this letter?');
      await dialog.accept();
    });

    // Click delete action
    await page.locator('#delete-letter-btn').click();
    await page.waitForURL('**/letters');

    // Verify empty state is shown (since there are no letters left)
    await expect(page.getByRole('heading', { name: /the vault is empty/i })).toBeVisible();
  });

  test('has no horizontal overflow at 320px viewport for letters views', async ({ page }) => {
    const letters = [
      {
        id: 'ltr-320',
        title: 'Title check for horizontal scroll safety',
        body: 'Letter body description for scroll checks.',
        category: 'miss-me',
        isLocked: false,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibleToPartner: true,
      }
    ];

    await page.setViewportSize({ width: 320, height: 720 });
    await openLettersInLocalMode(page, letters);

    // List view check
    let hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    // Details view check
    await page.goto('/letters/ltr-320');
    hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    // Edit form check
    await page.goto('/letters/ltr-320/edit');
    hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
