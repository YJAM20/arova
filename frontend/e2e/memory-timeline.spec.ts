import { test, expect, Page } from '@playwright/test';

async function openTimelineInLocalMode(page: Page, seedMemories: any[] = []): Promise<void> {
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
        importantDates: [],
        coupleProfile: {
          coupleSpaceName: 'Arova Space',
          partnerADisplayName: 'Partner A',
          partnerBDisplayName: 'Partner B',
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }, seedMemories);
  await page.goto('/memories/timeline');
}

test.describe('Arova Memory Timeline Flow', () => {
  test('loads timeline route and shows heading and empty state in Local Mode', async ({ page }) => {
    await openTimelineInLocalMode(page);

    // Heading checks
    await expect(page.locator('.eyebrow')).toHaveText('Orbit timeline');
    await expect(page.getByRole('heading', { name: 'Memory Timeline' })).toBeVisible();
    await expect(page.getByText('Every saved moment, arranged like stars.')).toBeVisible();

    // Empty state heading & helper copy
    await expect(page.getByRole('heading', { name: 'No timeline moments align yet' })).toBeVisible();
    await expect(page.getByText('Select another filter category or start adding memories to map out your private orbit timeline.')).toBeVisible();
  });

  test('displays seeded memories grouped by date on the timeline and links to detail page', async ({ page }) => {
    const memories = [
      {
        id: 'mem-time-1',
        title: 'Timeline Memory One',
        description: 'First description detail on timeline.',
        date: '2025-05-15',
        category: 'romantic',
        visibleToPartner: true,
        isFavorite: true,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    await openTimelineInLocalMode(page, memories);

    // Grouping checks
    await expect(page.locator('.year-marker')).toHaveText('2025');
    await expect(page.locator('.month-marker')).toHaveText('May');
    await expect(page.getByRole('heading', { name: 'Timeline Memory One' })).toBeVisible();

    // Link check
    await page.getByRole('heading', { name: 'Timeline Memory One' }).click();
    await page.waitForURL('**/memories/mem-time-1');
    expect(page.url()).toContain('/memories/mem-time-1');
  });

  test('displays On This Day panel and matching memory', async ({ page }) => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const dateStr = oneYearAgo.toISOString().slice(0, 10);

    const memories = [
      {
        id: 'mem-otd-1',
        title: 'OTD Memory One',
        description: 'This happened one year ago.',
        date: dateStr,
        category: 'funny',
        visibleToPartner: true,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    await openTimelineInLocalMode(page, memories);

    // Verify On This Day panel is visible
    await expect(page.locator('.on-this-day-panel')).toBeVisible();
    await expect(page.locator('.panel-title')).toHaveText('On This Day');
    await expect(page.locator('.on-this-day-panel').getByRole('heading', { name: 'OTD Memory One' })).toBeVisible();
    await expect(page.locator('.otd-badge')).toHaveText('1 year ago');
  });

  test('displays warm empty state in On This Day panel if no match', async ({ page }) => {
    await openTimelineInLocalMode(page);
    await expect(page.locator('.on-this-day-panel')).toBeVisible();
    await expect(page.getByText('No memory from this day yet. Maybe today becomes one.')).toBeVisible();
  });

  test('memories list page has CTA to timeline and displays On This Day strip', async ({ page }) => {
    const today = new Date();
    const twoYearsAgo = new Date(today);
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    const dateStr = twoYearsAgo.toISOString().slice(0, 10);

    const memories = [
      {
        id: 'mem-otd-list',
        title: 'List OTD Memory',
        description: 'Happened 2 years ago.',
        date: dateStr,
        category: 'romantic',
        visibleToPartner: true,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    await openTimelineInLocalMode(page, memories);
    
    // Go to Memories page
    await page.goto('/memories');
    await page.waitForURL('**/memories');

    // Check timeline CTA in header
    const timelineCTA = page.locator('.timeline-btn');
    await expect(timelineCTA).toBeVisible();
    await expect(timelineCTA).toHaveText('View as timeline');

    // Check On This Day Strip
    await expect(page.locator('.otd-strip')).toBeVisible();
    await expect(page.locator('.otd-strip')).toContainText('On This Day: You have 1 memory from your orbit, years ago.');

    // Click timeline CTA
    await timelineCTA.click();
    await page.waitForURL('**/memories/timeline');
    expect(page.url()).toContain('/memories/timeline');
  });

  test('dashboard shows On This Day card with memories or graceful empty state', async ({ page }) => {
    // 1. With OTD memory
    const today = new Date();
    const threeYearsAgo = new Date(today);
    threeYearsAgo.setFullYear(today.getFullYear() - 3);
    const dateStr = threeYearsAgo.toISOString().slice(0, 10);

    const memories = [
      {
        id: 'mem-dash-otd',
        title: 'Dashboard OTD Memory',
        description: 'Happened 3 years ago.',
        date: dateStr,
        category: 'deep',
        visibleToPartner: true,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    await openTimelineInLocalMode(page, memories);
    await page.goto('/universe');
    await page.waitForURL('**/universe');

    const otdCard = page.locator('#otd-dashboard-card');
    await expect(otdCard).toBeVisible();
    await expect(otdCard.locator('.otd-title-text')).toHaveText('Dashboard OTD Memory');
    await expect(otdCard.locator('.otd-year-badge')).toHaveText('3 years ago');

    // 2. Empty state
    await page.evaluate(() => {
      const parsed = JSON.parse(localStorage.getItem('love-universe-data-v1') || '{}');
      parsed.memories = [];
      localStorage.setItem('love-universe-data-v1', JSON.stringify(parsed));
    });
    await page.reload();
    await expect(otdCard.locator('.empty-state')).toBeVisible();
    await expect(otdCard.locator('.empty-desc')).toHaveText('No memory from this day yet. Maybe today becomes one.');
  });

  test('Local Mode makes no backend calls', async ({ page }) => {
    // Intercept any backend requests and throw an error if called
    await page.route('**/api/**', async (route) => {
      throw new Error(`Unexpected backend call in Local Mode: ${route.request().url()}`);
    });

    await openTimelineInLocalMode(page);
    // Verifying that navigation and loading does not trigger any api requests
    await expect(page.getByRole('heading', { name: 'Memory Timeline' })).toBeVisible();
  });

  test('API Mode does not fake success when backend offline', async ({ page }) => {
    page.on('console', (msg) => {
      console.log(`BROWSER CONSOLE: ${msg.text()}`);
    });

    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('love-universe-app-mode', 'api');
      localStorage.setItem('love-universe-api-token', 'offline-fake-token');
      const user = {
        id: 'user-owner',
        username: 'owner',
        passcode: '1234',
        displayName: 'Partner A',
        role: 'admin',
      };
      localStorage.setItem('love-universe-session-v1', JSON.stringify(user));
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
          users: [user],
        })
      );
    });

    // Mock SignalR negotiation endpoint failure
    await page.route('**/hubs/couple/negotiate**', async (route) => {
      await route.abort('failed');
    });

    // Catch-all mock for other API calls to fail immediately instead of hanging
    await page.route('**/api/**', async (route) => {
      await route.abort('failed');
    });

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

    // Mock score endpoint to fail immediately
    await page.route('**/api/relationship-score', async (route) => {
      await route.abort('failed');
    });

    // Mock backend offline (status 0)
    await page.route('**/api/memories', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/memories/timeline');
    
    await page.waitForTimeout(2000);
    
    // It should show compiled/friendly offline error, not faking success
    await expect(page.locator('.error-state')).toBeVisible();
    await expect(page.locator('.error-detail')).toContainText('Backend is not reachable. Make sure http://localhost:5036 is running.');
  });

  test('renders honest product mode details and no false E2EE/sync claims', async ({ page }) => {
    await openTimelineInLocalMode(page);

    const banner = page.locator('.product-honesty-banner');
    await expect(banner).toBeVisible();
    await expect(banner.locator('.banner-text')).toHaveText('Local Mode keeps this timeline in your browser.');
    await expect(banner.locator('.banner-note')).toHaveText('Note: True calendar syncing, Google Photos connection, map integrations, and AI timeline summaries are not active in this demo version.');
  });

  test('has no horizontal overflow at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    
    const memories = [
      {
        id: 'mem-320-timeline',
        title: 'Small screen timeline check',
        description: 'Testing responsiveness.',
        date: '2025-06-22',
        category: 'romantic',
        visibleToPartner: true,
        isFavorite: false,
        createdBy: 'user-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    await openTimelineInLocalMode(page, memories);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
