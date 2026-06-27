import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

async function openGoalsPageInLocalMode(
  page: Page,
  seedGoals: any[] = []
): Promise<void> {
  await page.goto('/');
  await page.evaluate((goals) => {
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
    localStorage.setItem('arova-couple-goals-v1', JSON.stringify(goals));
  }, seedGoals);
  await page.goto('/goals');
}

const SEED_GOALS = [
  {
    id: 'goal-1',
    coupleId: 'local-couple',
    createdByUserId: 'user-owner',
    createdByDisplayName: 'Partner A',
    title: 'Save for Summer Trip',
    description: 'We need around $2000 for hotels and flight tickets.',
    category: 'travel',
    status: 'in-progress',
    targetDate: '2026-08-30',
    progressPercent: 40,
    isPrivate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    milestones: [
      {
        id: 'ms-1',
        goalId: 'goal-1',
        title: 'Book flights',
        isCompleted: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ms-2',
        goalId: 'goal-1',
        title: 'Book Airbnb',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ms-3',
        goalId: 'goal-1',
        title: 'Rent a car',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'goal-2',
    coupleId: 'local-couple',
    createdByUserId: 'user-owner',
    createdByDisplayName: 'Partner A',
    title: 'Private Journaling Ritual',
    description: 'Keep a daily journal log.',
    category: 'relationship',
    status: 'not-started',
    isPrivate: true,
    progressPercent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    milestones: []
  }
];

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────

test.describe('Arova Couple Goals Board Flow', () => {

  test('loads goals route and displays header & summary metrics in Local Mode', async ({ page }) => {
    await openGoalsPageInLocalMode(page, SEED_GOALS);

    await expect(page.locator('#goals-eyebrow')).toContainText(/✦/);
    await expect(page.locator('.hero-title')).toBeVisible();

    // Stats verification
    await expect(page.locator('#total-goals-count')).toHaveText('2');
    await expect(page.locator('#active-goals-count')).toHaveText('2');
    await expect(page.locator('#completed-goals-count')).toHaveText('0');
  });

  test('shows empty state when no goals are seeded', async ({ page }) => {
    await openGoalsPageInLocalMode(page, []);

    await expect(page.locator('#goals-empty-state')).toBeVisible();
    await expect(page.locator('#goals-empty-state h3')).toBeVisible();
    await expect(page.locator('#empty-add-goal-btn')).toBeVisible();
  });

  test('can create a new couple goal', async ({ page }) => {
    await openGoalsPageInLocalMode(page, []);

    // Toggle add form
    await page.click('#toggle-add-goal-form');
    await expect(page.locator('#goals-form-section')).toBeVisible();

    // Fill form
    await page.fill('#goal-title-input', 'Build a treehouse');
    await page.fill('#goal-description-input', 'A small reading nook in the backyard oak tree.');
    await page.selectOption('#goal-category-select', 'creative');
    await page.selectOption('#goal-status-select', 'not-started');
    await page.fill('#goal-target-date-input', '2026-09-30');

    // Submit
    await page.click('#goal-submit-btn');

    // Verify card is added
    await expect(page.locator('.goal-card h3').first()).toHaveText('Build a treehouse');
    await expect(page.locator('#total-goals-count')).toHaveText('1');
    await expect(page.locator('#active-goals-count')).toHaveText('1');
  });

  test('can expand details, add milestones and check them to update progress', async ({ page }) => {
    await openGoalsPageInLocalMode(page, SEED_GOALS);

    // Expand the first goal card
    const targetGoalId = 'goal-1';
    await page.click(`#expand-goal-${targetGoalId}`);

    // Verify sub-checklist section is expanded
    await expect(page.locator(`#goal-card-${targetGoalId} .milestones-section`)).toBeVisible();

    // Add milestone
    await page.fill(`#new-milestone-input-${targetGoalId}`, 'Pack bags');
    await page.click(`#add-milestone-btn-${targetGoalId}`);

    // Verify milestone is added
    await expect(page.locator(`#goal-card-${targetGoalId} .milestone-item`)).toHaveCount(4);

    // Check progress before changes (1 of 4 completed -> 25%)
    await expect(page.locator(`#goal-card-${targetGoalId} .percent-val`)).toHaveText('25%');

    // Complete another milestone
    // Locate the checkbox for Book Airbnb (ms-2) and check it
    await page.check('#milestone-check-ms-2');

    // Verify progress recalculation (2 of 4 completed -> 50%)
    await expect(page.locator(`#goal-card-${targetGoalId} .percent-val`)).toHaveText('50%');

    // Delete a milestone
    await page.click('#delete-milestone-ms-3');
    
    // Verify milestones count (now 3) and progress (2 of 3 completed -> 66.67%)
    await expect(page.locator(`#goal-card-${targetGoalId} .milestone-item`)).toHaveCount(3);
    await expect(page.locator(`#goal-card-${targetGoalId} .percent-val`)).toHaveText('66.67%');
  });

  test('can directly complete a goal', async ({ page }) => {
    await openGoalsPageInLocalMode(page, SEED_GOALS);

    // Complete save for summer trip
    await page.click('#complete-goal-goal-1');

    // Verify card status updates to completed
    await expect(page.locator('#total-goals-count')).toHaveText('2');
    await expect(page.locator('#active-goals-count')).toHaveText('1');
    await expect(page.locator('#completed-goals-count')).toHaveText('1');
    
    // Progress should become 100%
    await expect(page.locator('#goal-card-goal-1 .percent-val')).toHaveText('100%');
  });

  test('can delete a goal', async ({ page }) => {
    await openGoalsPageInLocalMode(page, SEED_GOALS);

    // Click delete and handle confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to delete this goal?');
      await dialog.accept();
    });

    await page.click('#delete-goal-goal-2');

    // Verify goal count changes
    await expect(page.locator('#total-goals-count')).toHaveText('1');
  });

  test('does not communicate with ASP.NET backend API under Local Mode', async ({ page }) => {
    // Set up route intercept for backend API calls
    let apiCalled = false;
    await page.route('**/api/couple-goals**', async route => {
      apiCalled = true;
      await route.continue();
    });

    await openGoalsPageInLocalMode(page, SEED_GOALS);

    // Perform an update (checking a milestone)
    await page.click('#expand-goal-goal-1');
    await page.check('#milestone-check-ms-2');

    // Verify no API requests were triggered
    expect(apiCalled).toBe(false);
  });

  test('renders warning mode honest details in Local Mode', async ({ page }) => {
    await openGoalsPageInLocalMode(page, SEED_GOALS);

    const honestyText = page.locator('#goals-local-honesty');
    await expect(honestyText).toBeVisible();
    await expect(honestyText).toContainText(/keeps goals in this browser/i);
    await expect(honestyText).toContainText(/calendar sync and push notifications are not supported/i);
  });

  test('supports mobile responsiveness down to 320px', async ({ page }) => {
    await openGoalsPageInLocalMode(page, SEED_GOALS);

    // Set viewport to a small screen width
    await page.setViewportSize({ width: 320, height: 640 });

    // Verify main components are visible
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('#goals-board')).toBeVisible();
    await expect(page.locator('#goals-summary-cards')).toBeVisible();
    await expect(page.locator('#toggle-add-goal-form')).toBeVisible();
  });
});
