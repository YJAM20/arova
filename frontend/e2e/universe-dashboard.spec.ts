import { test, expect, Page } from '@playwright/test';

async function openDashboardInLocalMode(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => {
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
  });
  await page.goto('/universe');
}

test.describe('Arova Universe Dashboard Flow', () => {
  test('loads dashboard route after local mode session setup', async ({ page }) => {
    await openDashboardInLocalMode(page);

    // 1. Heading check
    const heading = page.locator('.hero-title');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Welcome back, Partner A/i);

    // 2. Welcome card subtitle (with couple display names)
    await expect(page.getByText(/Partner A & Partner B’s private universe/i)).toBeVisible();

    // 3. Today card prompt
    await expect(page.getByText(/What is one small thing you want your partner to remember about today/i)).toBeVisible();

    // 4. Guided Checklist Card
    await expect(page.locator('#checklist-dashboard-card')).toBeVisible();
  });

  test('displays quick actions and relationship planets', async ({ page }) => {
    await openDashboardInLocalMode(page);

    // Quick Actions
    await expect(page.locator('.quick-actions-grid').getByRole('link', { name: /add memory/i })).toBeVisible();
    await expect(page.locator('.quick-actions-grid').getByRole('link', { name: /write letter/i })).toBeVisible();
    await expect(page.locator('.quick-actions-grid').getByRole('link', { name: /check mood/i })).toBeVisible();

    // Planets
    await expect(page.getByRole('link', { name: /Memories Save photos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Letters Write private/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Mood Room Check in/i })).toBeVisible();
  });

  test('displays correct empty states for a new couple space', async ({ page }) => {
    await openDashboardInLocalMode(page);

    // Latest moments empty state
    await expect(page.getByText(/Your universe is quiet for now/i)).toBeVisible();

    // Mood snapshot empty state
    await expect(page.getByText(/No mood check-ins yet/i)).toBeVisible();

    // Future plans empty state
    await expect(page.getByText(/No future plans yet/i)).toBeVisible();

    // Shared goals empty state
    await expect(page.locator('#goals-dashboard-card')).toBeVisible();
    await expect(page.locator('#goals-empty-state')).toBeVisible();
    await expect(page.locator('#goals-empty-state')).toContainText(/no active goals right now/i);
  });

  test('displays active couple goals on the sidebar when present', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
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
            { id: 'user-owner', username: 'owner', passcode: '1234', displayName: 'Partner A', role: 'admin' }
          ],
          coupleProfile: {
            coupleSpaceName: 'Arova Space',
            partnerADisplayName: 'Partner A',
            partnerBDisplayName: 'Partner B',
            updatedAt: new Date().toISOString(),
          },
        })
      );
      // Seed an active goal
      localStorage.setItem('arova-couple-goals-v1', JSON.stringify([
        {
          id: 'goal-1',
          coupleId: 'local-couple',
          createdByUserId: 'user-owner',
          createdByDisplayName: 'Partner A',
          title: 'Learn French',
          category: 'learning',
          status: 'in-progress',
          progressPercent: 35,
          isPrivate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          milestones: []
        }
      ]));
    });

    await page.goto('/universe');

    // Verify goals card is present and shows active status and closest goal
    await expect(page.locator('#goals-dashboard-card')).toBeVisible();
    await expect(page.locator('#goals-active-state')).toBeVisible();
    await expect(page.locator('#goals-active-count')).toHaveText('1 Active Goal');
    await expect(page.locator('#closest-goal-title')).toHaveText('Learn French');
    await expect(page.locator('#closest-goal-progress')).toContainText('35%');
  });

  test('renders honest product mode details', async ({ page }) => {
    await openDashboardInLocalMode(page);

    // Mode badge
    await expect(page.locator('.mode-badge-label')).toContainText('Local Mode');
    await expect(page.getByText(/You are viewing Arova in Local Mode/i)).toBeVisible();
    await expect(page.getByText(/OAuth, SMS, billing, and true E2EE/i)).toBeVisible();
  });

  test('navigates to existing routes correctly from quick actions', async ({ page }) => {
    await openDashboardInLocalMode(page);

    // Click "Check mood" and verify page url redirects to check-in page
    await page.locator('.quick-actions-grid').getByRole('link', { name: /check mood/i }).click();
    await page.waitForURL('**/check-in');
    expect(page.url()).toContain('/check-in');
  });

  test('should display the rank badge in the header layout', async ({ page }) => {
    await openDashboardInLocalMode(page);

    // Desktop: Rank badge is visible and shows fallback state "Start your orbit" since points are 0
    const desktopBadge = page.locator('.desktop-header-badge arova-rank-badge');
    await expect(desktopBadge).toBeVisible();
    await expect(desktopBadge).toContainText('Start your orbit');

    // Switch to mobile viewport
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Desktop badge should be hidden
    await expect(page.locator('.desktop-header-badge')).toBeHidden();

    // Mobile badge should be visible in mobile header
    const mobileBadge = page.locator('.mobile-header-badge');
    await expect(mobileBadge).toBeVisible();
    await expect(mobileBadge).toContainText('Start your orbit');

    // Verify it doesn't break mobile layout (no overflow)
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('should display active rank, points, and streak when gamification data is present', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
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
      // Seed with points and streak
      localStorage.setItem('arova-relationship-points-v1', JSON.stringify({
        totalPoints: 120,
        streak: 3,
        lastActiveDate: new Date().toISOString().slice(0, 10),
        ledger: []
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
          coupleProfile: {
            coupleSpaceName: 'Arova Space',
            partnerADisplayName: 'Partner A',
            partnerBDisplayName: 'Partner B',
            updatedAt: new Date().toISOString(),
          },
        })
      );
    });

    await page.goto('/universe');

    // Desktop badge should show "Warmth", "120 pts", "3-day streak"
    const desktopBadge = page.locator('.desktop-header-badge arova-rank-badge');
    await expect(desktopBadge).toBeVisible();
    await expect(desktopBadge).toContainText('Warmth');
    await expect(desktopBadge).toContainText('120 pts');
    await expect(desktopBadge).toContainText('3-day streak');

    // Switch to mobile viewport
    await page.setViewportSize({ width: 320, height: 568 });

    // Mobile badge should show only "Warmth" (points and streak are collapsed on mobile)
    const mobileBadge = page.locator('.mobile-header-badge');
    await expect(mobileBadge).toBeVisible();
    await expect(mobileBadge).toContainText('Warmth');
    await expect(mobileBadge.locator('.badge-points')).toBeHidden();
    await expect(mobileBadge.locator('.badge-streak')).toBeHidden();
  });

  test('has no horizontal overflow at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openDashboardInLocalMode(page);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('direct refresh on dashboard route keeps user logged in and page stays valid', async ({ page }) => {
    await openDashboardInLocalMode(page);
    await expect(page.locator('.hero-title')).toBeVisible();

    // Perform reload
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('.hero-title')).toContainText(/Welcome back, Partner A/i);
  });
});
