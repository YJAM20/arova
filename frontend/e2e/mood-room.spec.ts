import { test, expect, Page } from '@playwright/test';

async function openMoodRoomInLocalMode(page: Page, seedMoods: any[] = []): Promise<void> {
  await page.goto('/');
  await page.evaluate((moods) => {
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
        letters: [],
        moods: moods,
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
  }, seedMoods);
  await page.goto('/mood');
}

test.describe('Arova Mood Room Flow', () => {
  test('loads mood room route with kicker, heading, and disclaimer in Local Mode', async ({ page }) => {
    await openMoodRoomInLocalMode(page);

    // Kicker & title checks
    await expect(page.locator('#mood-eyebrow')).toHaveText(/mood room/i);
    await expect(page.getByRole('heading', { name: /a gentle check-in for today/i })).toBeVisible();

    // Disclaimer check
    await expect(page.locator('.mood-disclaimer')).toContainText(/reflection tool, not medical or mental-health advice/i);

    // Sidebar empty check
    await expect(page.locator('.empty-state-sidebar')).toBeVisible();
    await expect(page.locator('.empty-state-sidebar h2')).toHaveText(/not set yet/i);
  });

  test('displays seeded moods history, correct summary stats, and empty history placeholder if empty', async ({ page }) => {
    // 1. First open with empty history to check empty state
    await openMoodRoomInLocalMode(page);
    await expect(page.getByRole('heading', { name: /no mood check-ins yet/i })).toBeVisible();
    await expect(page.getByText(/start with one small check-in/i)).toBeVisible();

    // 2. Re-open with seeded history
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const moods = [
      {
        id: 'mood-1',
        userId: 'user-owner',
        mood: 'happy',
        note: 'Seeded happy check-in from owner.',
        date: yesterdayStr,
        createdAt: yesterday.toISOString(),
      },
      {
        id: 'mood-2',
        userId: 'user-partner',
        mood: 'tired',
        note: 'Seeded partner tired check-in.',
        date: yesterdayStr,
        createdAt: yesterday.toISOString(),
      }
    ];

    await openMoodRoomInLocalMode(page, moods);

    // Verify history displays items
    await expect(page.locator('.history-list').getByText('Seeded happy check-in from owner.')).toBeVisible();
    await expect(page.locator('.history-list').getByText('Seeded partner tired check-in.')).toBeVisible();

    // Verify summary stats
    await expect(page.locator('.summary-cards')).toContainText('Total check-ins');
    await expect(page.locator('.summary-cards')).toContainText('1'); // owner count
    await expect(page.locator('.summary-cards')).toContainText('Seeded happy check-in from owner.');
    await expect(page.locator('.summary-cards')).toContainText('Tired'); // partner's status
  });

  test('supports selecting a mood, typing a note, and saving it to local history', async ({ page }) => {
    await openMoodRoomInLocalMode(page);

    // Select Calm mood
    await page.locator('#mood-option-silent').click();

    // Fill note
    await page.locator('#mood-note').fill('Today is a very calm and quiet day.');

    // Save
    await page.locator('#save-mood-submit').click();

    // Verify saved feedback
    await expect(page.locator('#save-success-indicator')).toBeVisible();

    // Verify sidebar today summary updates
    await expect(page.locator('.today-card h2')).toHaveText(/calm/i);
    await expect(page.locator('.today-card')).toContainText('Today is a very calm and quiet day.');

    // Verify item appended in history list
    await expect(page.locator('.history-list').nth(0)).toContainText('Today is a very calm and quiet day.');

    // Verify stats update
    await expect(page.locator('.summary-cards')).toContainText('Calm');
    await expect(page.locator('.summary-cards')).toContainText('1');
  });

  test('supports responding to partner mood check-ins', async ({ page }) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const moods = [
      {
        id: 'mood-partner-today',
        userId: 'user-partner',
        mood: 'sad',
        note: 'Tough day at work today.',
        date: todayStr,
        createdAt: new Date().toISOString(),
      }
    ];

    await openMoodRoomInLocalMode(page, moods);

    // Check partner's mood section is visible
    await expect(page.getByRole('heading', { name: /their mood today/i })).toBeVisible();
    await expect(page.locator('.other-card h3')).toHaveText(/low energy/i); // Sad mapped to low energy
    await expect(page.locator('.other-card')).toContainText('Tough day at work today.');

    // Write a response
    await page.locator('#response-input-mood-partner-today').fill('Sending you a big warm hug, you got this!');
    await page.getByRole('button', { name: /send response/i }).click();

    // Verify response shows up
    await expect(page.locator('.other-card')).toContainText('Your response');
    await expect(page.locator('.other-card')).toContainText('Sending you a big warm hug, you got this!');
  });

  test('has no horizontal overflow at 320px viewport', async ({ page }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const moods = [
      {
        id: 'mood-320',
        userId: 'user-owner',
        mood: 'happy',
        note: 'Very long checking note text to verify horizontal scroll limits on mobile devices.',
        date: yesterdayStr,
        createdAt: yesterday.toISOString(),
      }
    ];

    await page.setViewportSize({ width: 320, height: 720 });
    await openMoodRoomInLocalMode(page, moods);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
