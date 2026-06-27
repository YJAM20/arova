import { test, expect, Page } from '@playwright/test';

async function openDashboardInLocalMode(page: Page, ledger: any[] = []): Promise<void> {
  await page.goto('/');
  await page.evaluate((ledgerData) => {
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
    localStorage.setItem('arova-relationship-points-v1', JSON.stringify({
      totalPoints: ledgerData.reduce((sum, e) => sum + e.points, 0),
      streak: ledgerData.length > 0 ? 3 : 0,
      lastActiveDate: ledgerData.length > 0 ? new Date().toISOString().slice(0, 10) : '',
      ledger: ledgerData
    }));
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
          { id: 'user-owner', username: 'owner', passcode: '1234', displayName: 'Partner A', role: 'admin' }
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
        importantDates: [],
        coupleProfile: {
          coupleSpaceName: 'Arova Space',
          partnerADisplayName: 'Partner A',
          partnerBDisplayName: 'Partner B',
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }, ledger);
  await page.goto('/universe');
}

test.describe('Arova Activity Calendar & Streak Heatmap E2E', () => {
  test('Dashboard shows compact activity calendar card', async ({ page }) => {
    await openDashboardInLocalMode(page);
    await expect(page.locator('arova-streak-heatmap')).toBeVisible();
    await expect(page.getByText('Activity Calendar')).toBeVisible();
    await expect(page.getByText('View activity →')).toBeVisible();
  });

  test('Heatmap renders empty state gracefully when no activity exists', async ({ page }) => {
    await openDashboardInLocalMode(page);
    await expect(page.locator('.heatmap-grid')).toBeVisible();
    await expect(page.locator('.empty-state-overlay')).toContainText('No activity yet. Start with one small ritual today.');
    await expect(page.locator('#heatmap-streak-stat')).toContainText('0');
  });

  test('Seeded activity renders active cells and streak', async ({ page }) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const dayBefore = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const ledger = [
      { id: 'pts-1', action: 'Completed daily planet ritual', points: 50, timestamp: `${today}T12:00:00Z` },
      { id: 'pts-2', action: 'Answered daily question', points: 15, timestamp: `${yesterday}T12:00:00Z` },
      { id: 'pts-3', action: 'Preserved a new memory', points: 20, timestamp: `${dayBefore}T12:00:00Z` }
    ];

    await openDashboardInLocalMode(page, ledger);

    await expect(page.locator('#heatmap-streak-stat')).toContainText('3');
    await expect(page.locator('.heatmap-cell.level-1, .heatmap-cell.level-2, .heatmap-cell.level-3, .heatmap-cell.level-4').first()).toBeVisible();

    const activeCell = page.locator(`.heatmap-cell[title*="no activity"]`).first();
    await expect(activeCell).toBeVisible();
  });

  test('Planets page displays full Orbit History heatmap', async ({ page }) => {
    await openDashboardInLocalMode(page);
    await page.goto('/planets');
    await page.waitForURL('**/planets');
    
    await expect(page.locator('arova-streak-heatmap h3.header-title')).toContainText('Orbit History');
    await expect(page.locator('arova-streak-heatmap p.header-subtitle')).toContainText('A soft record of the rituals you kept together.');
  });

  test('API Mode offline displays offline error state gracefully', async ({ page }) => {

    // Mock setup status and auth/me calls to avoid redirecting during init
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'user-owner', username: 'owner', displayName: 'Partner A', role: 'admin' }),
      });
    });

    await page.route('**/api/setup/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isVerified: true,
          hasCompletedQuickOnboarding: true,
          hasCompletedProfile: true,
          hasCouple: true
        }),
      });
    });

    // Mock dashboard couples API calls
    await page.route(/\/api\/couples/, async (route, request) => {
      if (request.url().includes('/members')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'user-owner', displayName: 'Partner A' },
            { id: 'user-partner', displayName: 'Partner B' }
          ]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'couple-1', name: 'Arova Space' }),
        });
      }
    });

    // Mock other dashboard feeds to return empty arrays
    await page.route(/\/api\/memories/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route(/\/api\/reasons/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route(/\/api\/letters/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route(/\/api\/future-plans/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route(/\/api\/moods/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route(/\/api\/important-dates/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    // Intercept/Abort relationship-score ledger and score calls
    await page.route(/\/api\/relationship-score/, route => {
      route.abort('failed');
    });

    // Intercept/Abort couple hub negotiation
    await page.route(/\/hubs\/couple\/negotiate/, route => {
      route.abort('failed');
    });

    // Seed token and API mode
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('love-universe-app-mode', 'api');
      localStorage.setItem('love-universe-api-token', 'dummy-token');
      localStorage.setItem(
        'love-universe-session-v1',
        JSON.stringify({ id: 'user-owner', username: 'owner', passcode: '1234', displayName: 'Partner A', role: 'admin' })
      );
      localStorage.setItem(
        'love-universe-data-v1',
        JSON.stringify({
          version: '1.0.0',
          settings: {
            onboardingCompleted: true,
          }
        })
      );
    });

    await page.goto('/universe');
    
    await expect(page.locator('arova-streak-heatmap')).toBeVisible();
    await expect(page.locator('.heatmap-error')).toContainText('Orbit activity is offline');
  });

  test('Has no horizontal scroll and layout elements look clean down to 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await openDashboardInLocalMode(page);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    await page.goto('/planets');
    const planetsPageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(planetsPageOverflow).toBe(false);
  });
});
