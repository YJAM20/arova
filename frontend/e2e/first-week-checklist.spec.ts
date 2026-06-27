import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

async function openDashboardInLocalMode(
  page: Page,
  seedAppData: Partial<any> = {},
  checklistSeed: any = null
): Promise<void> {
  await page.goto('/');
  await page.evaluate(({ appData, checklist }) => {
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
        memories: appData.memories || [],
        reasons: appData.reasons || [],
        letters: appData.letters || [],
        moods: appData.moods || [],
        dailyQuestionAnswers: appData.dailyQuestionAnswers || [],
        checkIns: appData.checkIns || [],
        songs: appData.songs || [],
        challenges: [],
        futurePlans: [],
        importantDates: appData.importantDates || [],
        coupleProfile: {
          coupleSpaceName: 'Arova Space',
          partnerADisplayName: 'Partner A',
          partnerBDisplayName: 'Partner B',
          updatedAt: new Date().toISOString(),
        },
      })
    );
    if (checklist) {
      localStorage.setItem('arova-first-week-checklist-v1', JSON.stringify(checklist));
    }
    localStorage.setItem('arova-couple-goals-v1', JSON.stringify(appData.goals || []));
  }, { appData: seedAppData, checklist: checklistSeed });
  await page.goto('/universe');
}

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────

test.describe('Arova Guided Onboarding Checklist', () => {

  test('Dashboard shows First Week checklist for new Local Mode space with correct warning text', async ({ page }) => {
    await openDashboardInLocalMode(page, {});

    // Verify card is visible
    await expect(page.locator('#checklist-dashboard-card')).toBeVisible();
    await expect(page.locator('#checklist-active-state')).toBeVisible();
    await expect(page.locator('#checklist-title')).toHaveText('First Week in Arova');
    
    // Check initial progress label
    await expect(page.locator('#checklist-progress-count')).toHaveText('0 / 10 completed');
    await expect(page.locator('#checklist-progress-percent')).toHaveText('0%');

    // Verify honest warning text
    const localWarning = page.locator('#checklist-local-mode-warning');
    await expect(localWarning).toBeVisible();
    await expect(localWarning).toContainText(/keeps this progress in your browser/i);
    await expect(localWarning).toContainText(/AI recommendations and push notifications are not active/i);
  });

  test('CTA navigates to correct feature route', async ({ page }) => {
    await openDashboardInLocalMode(page, {});

    // Click "Add memory" CTA
    await page.click('#checklist-cta-first-memory');

    // Verify redirected to memories/new page
    await page.waitForURL('**/memories/new');
    expect(page.url()).toContain('/memories/new');
  });

  test('Adding a memory marks the memory task completed', async ({ page }) => {
    // Seed with 0 memories
    await openDashboardInLocalMode(page, { memories: [] });
    await expect(page.locator('#checklist-row-first-memory .item-action-link')).toBeVisible();

    // Reload with 1 memory seeded
    await openDashboardInLocalMode(page, {
      memories: [
        {
          id: 'mem-1',
          title: 'First Date',
          description: 'A coffee date',
          date: '2026-06-20',
          createdAt: new Date().toISOString(),
        }
      ]
    });

    // Check memory task row state is completed
    await expect(page.locator('#checklist-row-first-memory .item-completed-text')).toBeVisible();
    await expect(page.locator('#checklist-row-first-memory .item-action-link')).toBeHidden();
    
    // Verify progress count changed to 1
    await expect(page.locator('#checklist-progress-count')).toHaveText('1 / 10 completed');
  });

  test('Dismiss and snooze work and persist after page reloads', async ({ page }) => {
    await openDashboardInLocalMode(page, {});

    // Dismiss checklist
    await page.click('#checklist-dismiss-btn');

    // Verify checklist card is hidden
    await expect(page.locator('#checklist-dashboard-card')).toBeHidden();

    // Reload page
    await page.reload();

    // Verify it remains hidden
    await expect(page.locator('#checklist-dashboard-card')).toBeHidden();
  });

  test('Snooze hides checklist card and persists', async ({ page }) => {
    await openDashboardInLocalMode(page, {});

    // Click Snooze
    await page.click('#checklist-snooze-btn');

    // Verify hidden
    await expect(page.locator('#checklist-dashboard-card')).toBeHidden();

    // Reload
    await page.reload();

    // Verify remains hidden
    await expect(page.locator('#checklist-dashboard-card')).toBeHidden();
  });

  test('Completed checklist shows celebration state and does not dominate the dashboard', async ({ page }) => {
    // Seed checklist with all completed
    const fullyCompletedAppData = {
      memories: [{ id: '1' }],
      letters: [{ id: '1' }],
      reasons: [{ id: '1' }],
      moods: [{ id: '1' }],
      songs: [{ id: '1' }],
      dailyQuestionAnswers: [{ id: '1' }],
      checkIns: [{ id: '1' }],
      importantDates: [{ id: '1' }],
      goals: [{ id: '1' }]
    };

    // To complete planet visit as well, we seed planetVisited state in localStorage
    await openDashboardInLocalMode(page, fullyCompletedAppData, {
      dismissed: false,
      snoozedUntil: null,
      planetVisited: true
    });

    // Verify celebration screen is rendered
    await expect(page.locator('#checklist-complete-state')).toBeVisible();
    await expect(page.locator('#checklist-complete-state h3')).toHaveText('Your universe has its first rhythm.');

    // Click "Continue building" which dismisses/hides the card
    await page.click('#checklist-continue-btn');
    await expect(page.locator('#checklist-dashboard-card')).toBeHidden();
  });

  test('does not make backend API calls for checklist state in Local Mode', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/api/checklist**', async route => {
      apiCalled = true;
      await route.continue();
    });

    await openDashboardInLocalMode(page, {});

    // Verify page loaded and checklist rendered
    await expect(page.locator('#checklist-dashboard-card')).toBeVisible();
    expect(apiCalled).toBe(false);
  });

  test('has no horizontal overflow at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openDashboardInLocalMode(page, {});

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
