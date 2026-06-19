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
  });

  test('displays quick actions and relationship planets', async ({ page }) => {
    await openDashboardInLocalMode(page);

    // Quick Actions
    await expect(page.getByRole('link', { name: /add memory/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /write letter/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /check mood/i })).toBeVisible();

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
    await page.getByRole('link', { name: /check mood/i }).click();
    await page.waitForURL('**/check-in');
    expect(page.url()).toContain('/check-in');
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
