import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

async function openFutureBoardInLocalMode(
  page: Page,
  seedPlans: any[] = []
): Promise<void> {
  await page.goto('/');
  await page.evaluate((plans) => {
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
        futurePlans: plans,
        coupleProfile: {
          coupleSpaceName: 'Arova Space',
          partnerADisplayName: 'Partner A',
          partnerBDisplayName: 'Partner B',
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }, seedPlans);
  await page.goto('/future');
}

const nowIso = () => new Date().toISOString();

const SEED_PLANS = [
  {
    id: 'plan-1',
    title: 'Visit Iceland',
    description: 'See the Northern Lights together.',
    type: 'travel',
    status: 'planned',
    priority: 'high',
    createdBy: 'user-owner',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'plan-2',
    title: 'Learn to cook ramen',
    description: 'Make it from scratch on a rainy day.',
    type: 'food',
    status: 'one-day',
    priority: 'medium',
    createdBy: 'user-owner',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'plan-3',
    title: 'Watch all Studio Ghibli films',
    description: '',
    type: 'movie',
    status: 'in-progress',
    priority: 'low',
    createdBy: 'user-owner',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'plan-4',
    title: 'First completed goal',
    description: 'Something already done.',
    type: 'dream',
    status: 'done',
    priority: 'medium',
    createdBy: 'user-owner',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────

test.describe('Arova Future Board Flow', () => {
  test('loads the future board route with eyebrow and h1 heading in Local Mode', async ({ page }) => {
    await openFutureBoardInLocalMode(page);

    await expect(page.locator('#future-eyebrow')).toContainText(/future board/i);
    await expect(
      page.getByRole('heading', { name: /plans worth growing into/i })
    ).toBeVisible();
  });

  test('shows the empty state when no plans are present', async ({ page }) => {
    await openFutureBoardInLocalMode(page);

    await expect(page.locator('#future-empty-state')).toBeVisible();
    await expect(page.locator('#future-empty-state h3')).toHaveText(/no future plans yet/i);
    await expect(page.locator('#future-empty-state')).toContainText(
      /start with one small idea/i
    );
  });

  test('shows add plan CTA button in empty state', async ({ page }) => {
    await openFutureBoardInLocalMode(page);

    await expect(page.locator('#empty-add-plan-btn')).toBeVisible();
  });

  test('renders seeded plans in the board columns', async ({ page }) => {
    await openFutureBoardInLocalMode(page, SEED_PLANS);

    // Board should be visible
    await expect(page.locator('#future-board')).toBeVisible();

    // Planned column has "Visit Iceland"
    await expect(page.locator('#column-planned')).toContainText('Visit Iceland');

    // One-day column has "Learn to cook ramen"
    await expect(page.locator('#column-one-day')).toContainText('Learn to cook ramen');

    // In-progress column has "Watch all Studio Ghibli"
    await expect(page.locator('#column-in-progress')).toContainText(
      'Watch all Studio Ghibli films'
    );

    // Done column has "First completed goal"
    await expect(page.locator('#column-done')).toContainText('First completed goal');
  });

  test('displays summary stats correctly with seeded plans', async ({ page }) => {
    await openFutureBoardInLocalMode(page, SEED_PLANS);

    await expect(page.locator('#future-summary-cards')).toBeVisible();
    // Total non-secret plans: 4
    await expect(page.locator('#total-plans-count')).toHaveText('4');
    // Completed: 1
    await expect(page.locator('#completed-plans-count')).toHaveText('1');
    // In progress: 1
    await expect(page.locator('#inprogress-plans-count')).toHaveText('1');
    // Planned (planned status): 1
    await expect(page.locator('#upcoming-plans-count')).toHaveText('1');
  });

  test('can add a new future plan via the form', async ({ page }) => {
    await openFutureBoardInLocalMode(page);

    // Open form
    await page.locator('#toggle-add-plan-form').click();
    await expect(page.locator('#future-plan-form')).toBeVisible();

    // Fill form
    await page.locator('#plan-title-input').fill('Visit Japan together');
    await page.locator('#plan-description-input').fill('Cherry blossom season.');

    // Select category Travel
    await page.locator('#plan-type-select').selectOption('travel');

    // Select status Planned
    await page.locator('#plan-status-select').selectOption('planned');

    // Submit
    await page.locator('#plan-submit-btn').click();

    // Success toast appears
    await expect(page.locator('#plan-save-success')).toBeVisible();

    // Plan appears in board (planned column)
    await expect(page.locator('#column-planned')).toContainText('Visit Japan together');

    // Summary stats update
    await expect(page.locator('#total-plans-count')).toHaveText('1');
    await expect(page.locator('#upcoming-plans-count')).toHaveText('1');
  });

  test('submit button is disabled without a plan title', async ({ page }) => {
    await openFutureBoardInLocalMode(page);

    await page.locator('#toggle-add-plan-form').click();
    await expect(page.locator('#plan-submit-btn')).toBeDisabled();

    await page.locator('#plan-title-input').fill('Something');
    await expect(page.locator('#plan-submit-btn')).toBeEnabled();
  });

  test('status filter chips switch to filtered list view', async ({ page }) => {
    await openFutureBoardInLocalMode(page, SEED_PLANS);

    // Board view visible by default
    await expect(page.locator('#future-board')).toBeVisible();

    // Click "Planned" filter chip
    await page.locator('#filter-chip-planned').click();

    // Filtered list view replaces board
    await expect(page.locator('#future-filtered-list')).toBeVisible();
    await expect(page.locator('#future-board')).not.toBeVisible();

    // Only "Visit Iceland" should be visible
    await expect(page.locator('#future-filtered-list')).toContainText('Visit Iceland');
    await expect(page.locator('#future-filtered-list')).not.toContainText('Learn to cook ramen');

    // Switch back to All
    await page.locator('#filter-chip-all').click();
    await expect(page.locator('#future-board')).toBeVisible();
  });

  test('can mark a plan as done', async ({ page }) => {
    await openFutureBoardInLocalMode(page, SEED_PLANS);

    // Mark "Visit Iceland" as done (it's in planned column)
    await page.locator('#mark-done-plan-1').click();

    // Should move to done column
    await expect(page.locator('#column-done')).toContainText('Visit Iceland');

    // Completed count increments
    await expect(page.locator('#completed-plans-count')).toHaveText('2');
  });

  test('can edit a plan and update its title', async ({ page }) => {
    await openFutureBoardInLocalMode(page, SEED_PLANS);

    // Click edit on plan-2
    await page.locator('#edit-plan-plan-2').click();

    // Form opens with edit mode
    await expect(page.locator('#future-plan-form')).toBeVisible();
    await expect(page.locator('#plan-title-input')).toHaveValue('Learn to cook ramen');

    // Update the title
    await page.locator('#plan-title-input').fill('Learn to cook tonkotsu ramen');
    await page.locator('#plan-submit-btn').click();

    // Toast appears
    await expect(page.locator('#plan-save-success')).toBeVisible();

    // Updated title is in the board
    await expect(page.locator('#column-one-day')).toContainText('Learn to cook tonkotsu ramen');
  });

  test('can delete a plan', async ({ page }) => {
    await openFutureBoardInLocalMode(page, SEED_PLANS);

    // Confirm plan-3 is visible
    await expect(page.locator('#plan-card-plan-3')).toBeVisible();

    // Delete it
    await page.locator('#delete-plan-plan-3').click();

    // Card is gone
    await expect(page.locator('#plan-card-plan-3')).not.toBeVisible();

    // Summary stats updated (now 3 total)
    await expect(page.locator('#total-plans-count')).toHaveText('3');
  });

  test('empty state appears when filter matches no plans', async ({ page }) => {
    // Only "one-day" and "in-progress" plans in seed; filter to "planned" (only 1)
    await openFutureBoardInLocalMode(page, [
      {
        id: 'plan-solo',
        title: 'Only one day plan',
        type: 'dream',
        status: 'one-day',
        priority: 'low',
        createdBy: 'user-owner',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ]);

    // Filter to "planned" — should show empty state
    await page.locator('#filter-chip-planned').click();

    await expect(page.locator('#future-empty-state')).toBeVisible();
    await expect(page.locator('#future-empty-state h3')).toHaveText(/no future plans yet/i);
  });

  test('Local Mode does not require a backend call', async ({ page }) => {
    let backendCalled = false;
    await page.route('**/api/**', () => {
      backendCalled = true;
    });

    await openFutureBoardInLocalMode(page, SEED_PLANS);
    await expect(page.locator('#future-board')).toBeVisible();
    expect(backendCalled).toBe(false);
  });

  test('has no horizontal overflow at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openFutureBoardInLocalMode(page, SEED_PLANS);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
