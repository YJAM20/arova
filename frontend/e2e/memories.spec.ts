import { test, expect, Page } from '@playwright/test';

async function openMemoriesInLocalMode(page: Page, seedMemories: any[] = []): Promise<void> {
  await page.goto('/');
  await page.evaluate((memories) => {
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
        memories: memories,
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
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }, seedMemories);
  await page.goto('/memories');
}

test.describe('Arova Memories Page Flow', () => {
  test('loads route with heading, kicker, and add memory CTA in Local Mode', async ({ page }) => {
    await openMemoriesInLocalMode(page);

    // Kicker and Heading checks
    await expect(page.getByRole('main').locator('.eyebrow').getByText('Memories', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /moments worth keeping/i })).toBeVisible();

    // Subtitle check
    await expect(page.getByText(/A calm private archive for the photos/i)).toBeVisible();

    // Add Memory link
    await expect(page.locator('arova-page-header').getByRole('link', { name: /add memory/i })).toBeVisible();
  });

  test('displays correct empty state if no memories are preserved', async ({ page }) => {
    await openMemoriesInLocalMode(page);

    // Empty state heading & helper copy
    await expect(page.getByRole('heading', { name: /your memory archive is quiet for now/i })).toBeVisible();
    await expect(page.getByText(/Start with one moment — a photo, a note/i)).toBeVisible();
  });

  test('displays cards and supports navigation for seeded memories', async ({ page }) => {
    const memories = [
      {
        id: 'mem-1',
        title: 'Seeded Memory Title One',
        description: 'Seeded description detail of first memory.',
        date: '2026-06-19',
        category: 'romantic',
        visibleToPartner: true,
        isFavorite: true,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    await openMemoriesInLocalMode(page, memories);

    // Grid displays cards
    await expect(page.getByRole('heading', { name: 'Seeded Memory Title One' })).toBeVisible();
    await expect(page.getByText('Seeded description detail of first memory.')).toBeVisible();

    // Category and owner tags check
    await expect(page.locator('.memory-meta').getByText('Romantic', { exact: true })).toBeVisible();
    await expect(page.getByText('Preserved by You')).toBeVisible();

    // Click card and verify navigation to detail page
    await page.getByRole('heading', { name: 'Seeded Memory Title One' }).click();
    await page.waitForURL('**/memories/mem-1');
    expect(page.url()).toContain('/memories/mem-1');
  });

  test('has no horizontal overflow at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openMemoriesInLocalMode(page);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('verifies details view layout and missing image placeholder', async ({ page }) => {
    const memories = [
      {
        id: 'mem-2',
        title: 'Details Testing Memory',
        description: 'Detail verification description.',
        date: '2026-06-19',
        category: 'funny',
        visibleToPartner: true,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    await openMemoriesInLocalMode(page, memories);

    // Go directly to detail view
    await page.goto('/memories/mem-2');

    // Title and kicker check
    await expect(page.locator('.page-kicker')).toHaveText('Memory');
    await expect(page.locator('.memory-title')).toHaveText('Details Testing Memory');

    // Placeholder image
    await expect(page.locator('.hero-placeholder')).toBeVisible();
    await expect(page.locator('.placeholder-text')).toHaveText('Moments worth keeping');

    // Metadata items check
    await expect(page.locator('.metadata-grid')).toContainText('Funny');
    await expect(page.locator('.metadata-grid')).toContainText('You');

    // Actions check
    await expect(page.locator('.action-btn--edit')).toBeVisible();
    await expect(page.locator('.action-btn--delete')).toBeVisible();
  });

  test('displays missing state for non-existent memory ID', async ({ page }) => {
    await openMemoriesInLocalMode(page);
    await page.goto('/memories/does-not-exist');

    // Alert role exists and shows cannot find
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('heading', { name: /we couldn’t find this memory/i })).toBeVisible();
  });

  test('supports adding a new memory and saves it to local mode list', async ({ page }) => {
    await openMemoriesInLocalMode(page);

    // Click Add Memory link
    await page.locator('arova-page-header').getByRole('link', { name: /add memory/i }).click();
    await page.waitForURL('**/memories/new');

    // Verify copy of Add form
    await expect(page.getByRole('heading', { name: 'Add a memory' })).toBeVisible();
    await expect(page.getByText('Save a photo, a note, a date, or a small detail you both might want to return to.')).toBeVisible();

    // Check custom labels
    await expect(page.locator('label[for="title"]')).toHaveText('Memory title');
    await expect(page.locator('label[for="description"]')).toHaveText('Memory note');
    await expect(page.locator('label[for="date"]')).toHaveText('Memory date');
    await expect(page.locator('label[for="imageUrl"]')).toHaveText('Image URL');

    // Fill form
    await page.locator('#title').fill('A Brand New Shared Memory');
    await page.locator('#description').fill('We had coffee here for the first time.');
    await page.locator('#date').fill('2026-05-15');
    await page.locator('#category').selectOption('firsts');
    await page.locator('#imageUrl').fill('https://example.com/photo.jpg');

    // Toggle favorite card
    await page.locator('.toggle-card').filter({ hasText: 'Mark as favorite' }).click();

    // Submit
    await page.locator('button[type="submit"]').click();

    // Verifies navigation back to memories list
    await page.waitForURL('**/memories');

    // Verify item in list
    await expect(page.getByRole('heading', { name: 'A Brand New Shared Memory' })).toBeVisible();
  });

  test('supports editing an existing memory', async ({ page }) => {
    const memories = [
      {
        id: 'mem-edit-test',
        title: 'Original Title',
        description: 'Original description.',
        date: '2026-06-19',
        category: 'romantic',
        visibleToPartner: true,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    await openMemoriesInLocalMode(page, memories);
    await page.goto('/memories/mem-edit-test');

    // Click edit action
    await page.locator('.action-btn--edit').click();
    await page.waitForURL('**/memories/mem-edit-test/edit');

    // Verify edit form header copy
    await expect(page.getByRole('heading', { name: 'Refine this memory' })).toBeVisible();

    // Modify title and note
    await page.locator('#title').fill('Updated Memory Title');
    await page.locator('#description').fill('Updated description details.');

    // Save changes
    await page.getByRole('button', { name: 'Save changes' }).click();

    // Navigates back to list
    await page.waitForURL('**/memories');

    // Verify updated title
    await expect(page.getByRole('heading', { name: 'Updated Memory Title' })).toBeVisible();
  });

  test('has no horizontal overflow at 320px viewport for details and form pages', async ({ page }) => {
    const memories = [
      {
        id: 'mem-320',
        title: 'Seeded Memory Title for 320px check',
        description: 'Seeded description detail for 320px check.',
        date: '2026-06-19',
        category: 'romantic',
        visibleToPartner: true,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    // Details view 320px check
    await page.setViewportSize({ width: 320, height: 720 });
    await openMemoriesInLocalMode(page, memories);

    await page.goto('/memories/mem-320');
    let hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    // Edit form 320px check
    await page.goto('/memories/mem-320/edit');
    hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
