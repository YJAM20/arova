import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

async function openMusicRoomInLocalMode(page: Page, seedSongs: any[] = []): Promise<void> {
  await page.goto('/');
  await page.evaluate((songs) => {
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
        moods: [],
        dailyQuestionAnswers: [],
        checkIns: [],
        songs: songs,
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
  }, seedSongs);
  await page.goto('/music');
}

const SEED_SONGS = [
  {
    id: 'song-1',
    title: 'Bloom',
    artist: 'The Paper Kites',
    mood: 'happy',
    isFavorite: false,
    sourceName: 'Demo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'song-2',
    title: 'Skinny Love',
    artist: 'Bon Iver',
    mood: 'missing-you',
    isFavorite: true,
    sourceName: 'Demo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'song-3',
    title: 'Fade Into You',
    artist: 'Mazzy Star',
    mood: 'silent',
    isFavorite: false,
    sourceName: 'Demo',
    createdAt: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────

test.describe('Arova Music Room Flow', () => {
  test('loads the music room route with eyebrow kicker and disclaimer in Local Mode', async ({ page }) => {
    await openMusicRoomInLocalMode(page);

    // Kicker and heading
    await expect(page.locator('#music-eyebrow')).toContainText(/music room/i);
    await expect(page.getByRole('heading', { name: /your shared soundtrack/i })).toBeVisible();

    // Disclaimer footer
    await expect(page.locator('#music-disclaimer')).toContainText(/private reflection space/i);
    await expect(page.locator('#music-disclaimer')).toContainText(/not a streaming platform/i);
  });

  test('shows the empty state when no songs are present', async ({ page }) => {
    await openMusicRoomInLocalMode(page);

    await expect(page.locator('#music-empty-state')).toBeVisible();
    await expect(page.locator('#music-empty-state h3')).toHaveText(/no melodies yet/i);
  });

  test('renders seeded songs in the grid', async ({ page }) => {
    await openMusicRoomInLocalMode(page, SEED_SONGS);

    await expect(page.locator('#songs-grid')).toBeVisible();
    await expect(page.locator('[id^="song-card-"]')).toHaveCount(3);

    // Verify song titles and artists
    await expect(page.locator('#songs-grid')).toContainText('Bloom');
    await expect(page.locator('#songs-grid')).toContainText('The Paper Kites');
    await expect(page.locator('#songs-grid')).toContainText('Skinny Love');
    await expect(page.locator('#songs-grid')).toContainText('Bon Iver');
  });

  test('renders summary stats correctly when songs are present', async ({ page }) => {
    await openMusicRoomInLocalMode(page, SEED_SONGS);

    await expect(page.locator('#music-summary-cards')).toBeVisible();
    await expect(page.locator('#total-songs-count')).toHaveText('3');
    // 1 favourite (Skinny Love)
    await expect(page.locator('#favorites-count')).toHaveText('1');
  });

  test('can add a new melody through the add song form', async ({ page }) => {
    await openMusicRoomInLocalMode(page);

    // Open form
    await page.locator('#toggle-add-song-form').click();
    await expect(page.locator('#add-song-form')).toBeVisible();

    // Fill form
    await page.locator('#song-title-input').fill('Stars');
    await page.locator('#song-artist-input').fill('Editors');
    await page.locator('#song-source-name-input').fill('Spotify');

    // Submit
    await page.locator('#song-submit-btn').click();

    // Success toast appears
    await expect(page.locator('#song-save-success')).toBeVisible();

    // Song appears in grid
    await expect(page.locator('#songs-grid')).toContainText('Stars');
    await expect(page.locator('#songs-grid')).toContainText('Editors');

    // Summary stats update
    await expect(page.locator('#total-songs-count')).toHaveText('1');
  });

  test('add song form is invalid without a title', async ({ page }) => {
    await openMusicRoomInLocalMode(page);

    await page.locator('#toggle-add-song-form').click();
    await expect(page.locator('#add-song-form')).toBeVisible();

    // Submit button should be disabled with empty title
    await expect(page.locator('#song-submit-btn')).toBeDisabled();

    // Fill title and verify button becomes enabled
    await page.locator('#song-title-input').fill('A melody');
    await expect(page.locator('#song-submit-btn')).toBeEnabled();
  });

  test('mood filter chips filter the song list correctly', async ({ page }) => {
    await openMusicRoomInLocalMode(page, SEED_SONGS);

    // Initially all 3 visible
    await expect(page.locator('[id^="song-card-"]')).toHaveCount(3);

    // Click "Happy" filter
    await page.locator('#filter-chip-happy').click();
    await expect(page.locator('[id^="song-card-"]')).toHaveCount(1);
    await expect(page.locator('#songs-grid')).toContainText('Bloom');

    // Click "Missing you" filter
    await page.locator('#filter-chip-missing-you').click();
    await expect(page.locator('[id^="song-card-"]')).toHaveCount(1);
    await expect(page.locator('#songs-grid')).toContainText('Skinny Love');

    // Click "All" to reset
    await page.locator('#filter-chip-all').click();
    await expect(page.locator('[id^="song-card-"]')).toHaveCount(3);
  });

  test('shows empty state when mood filter matches no songs', async ({ page }) => {
    await openMusicRoomInLocalMode(page, SEED_SONGS);

    // Click "Sad" filter — no songs tagged sad in seed data
    await page.locator('#filter-chip-sad').click();
    await expect(page.locator('#music-empty-state')).toBeVisible();
    await expect(page.locator('#music-empty-state')).toContainText(/no tracks tagged with this mood/i);
  });

  test('can toggle favourite on a song card', async ({ page }) => {
    await openMusicRoomInLocalMode(page, SEED_SONGS);

    // Initial favourite count should be 1 (Skinny Love)
    await expect(page.locator('#favorites-count')).toHaveText('1');

    // Toggle the first song (Bloom) to favourite
    const bloomCard = page.locator('#song-card-song-1');
    await bloomCard.locator('button[aria-label*="favourite"]').click();

    // Favourite count should now be 2
    await expect(page.locator('#favorites-count')).toHaveText('2');
  });

  test('random song button selects a song when songs exist', async ({ page }) => {
    await openMusicRoomInLocalMode(page, SEED_SONGS);

    // Ensure random song button is enabled
    await expect(page.locator('#random-song-btn')).toBeEnabled();
    await page.locator('#random-song-btn').click();

    // Some song should now be shown in the player
    await expect(page.getByText('Now playing')).toBeVisible();
  });

  test('can delete a song from the grid', async ({ page }) => {
    await openMusicRoomInLocalMode(page, SEED_SONGS);

    // Should start with 3 songs
    await expect(page.locator('[id^="song-card-"]')).toHaveCount(3);

    // Hover to reveal delete button and click it
    await page.locator('#song-card-song-1').hover();
    await page.locator('#delete-song-song-1').click();

    // Now only 2 songs remain
    await expect(page.locator('[id^="song-card-"]')).toHaveCount(2);
    await expect(page.locator('#songs-grid')).not.toContainText('Bloom');

    // Summary stats update
    await expect(page.locator('#total-songs-count')).toHaveText('2');
  });

  test('song count badge reflects current filter state', async ({ page }) => {
    await openMusicRoomInLocalMode(page, SEED_SONGS);

    await expect(page.locator('#song-count-badge')).toContainText('3 / 3');

    await page.locator('#filter-chip-happy').click();
    await expect(page.locator('#song-count-badge')).toContainText('1 / 3');
  });

  test('has no horizontal overflow at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openMusicRoomInLocalMode(page, SEED_SONGS);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('does not make backend API calls for music state in Local Mode', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/api/songs**', async route => {
      apiCalled = true;
      await route.continue();
    });

    await openMusicRoomInLocalMode(page);
    await expect(page.locator('#music-disclaimer')).toBeVisible();
    expect(apiCalled).toBe(false);
  });

  test('displays offline error message in API Mode if backend is unreachable', async ({ page }) => {
    // Inject API mode and dummy token
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('love-universe-app-mode', 'api');
      localStorage.setItem('love-universe-api-token', 'dummy-token-placeholder');
      localStorage.setItem(
        'love-universe-data-v1',
        JSON.stringify({
          version: '1.0.0',
          settings: { onboardingCompleted: true }
        })
      );
    });

    // Mock auth me to bypass auth guard check
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'user-owner', displayName: 'Partner A' })
      });
    });

    // Mock setup status to bypass onboarding checks
    await page.route('**/api/setup/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isVerified: true,
          hasCompletedQuickOnboarding: true,
          hasCompletedProfile: true,
          hasCouple: true,
        }),
      });
    });

    // Mock API fail on loading songs
    await page.route('**/api/songs**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Backend is not reachable. Make sure http://localhost:5036 is running.' })
      });
    });

    await page.goto('/music');
    // Verify error banner is displayed
    const errorAlert = page.locator('.error-banner');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/backend is not reachable/i);
  });

  test('contains external links disclaimers and mode limits copy', async ({ page }) => {
    await openMusicRoomInLocalMode(page, [
      {
        id: 'song-link-test',
        title: 'Bloom',
        artist: 'The Paper Kites',
        mood: 'happy',
        sourceName: 'YouTube',
        sourceUrl: 'https://youtube.com/watch?v=dummy',
        isFavorite: false,
        createdAt: new Date().toISOString()
      }
    ]);

    // Select the song
    await page.locator('#song-card-song-link-test').click();

    // Verify external link action and disclaimers are visible
    await expect(page.locator('#player-external-link')).toBeVisible();
    await expect(page.locator('.external-link-hint')).toContainText(/External links open outside Arova/i);

    // Local mode warning
    await expect(page.locator('#music-local-warning')).toBeVisible();

    // API Mode warning
    await page.evaluate(() => {
      localStorage.setItem('love-universe-app-mode', 'api');
      localStorage.setItem('love-universe-api-token', 'dummy-token-placeholder');
      localStorage.setItem(
        'love-universe-data-v1',
        JSON.stringify({
          version: '1.0.0',
          settings: { onboardingCompleted: true }
        })
      );
    });
    // Mock auth me to bypass auth guard check on reload
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'user-owner', displayName: 'Partner A' })
      });
    });
    // Mock setup status to bypass onboarding checks on reload
    await page.route('**/api/setup/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isVerified: true,
          hasCompletedQuickOnboarding: true,
          hasCompletedProfile: true,
          hasCouple: true,
        }),
      });
    });
    await page.route('**/api/songs**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.reload();
    await expect(page.locator('#music-api-warning')).toBeVisible();
  });
});
