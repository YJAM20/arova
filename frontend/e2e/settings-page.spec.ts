import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

async function openSettingsInLocalMode(page: Page): Promise<void> {
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
          { id: 'user-owner', username: 'owner', passcode: '1234', displayName: 'Partner A', role: 'admin' },
          { id: 'user-partner', username: 'partner', passcode: '1234', displayName: 'Partner B', role: 'partner' },
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
  await page.goto('/settings');
}

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────

test.describe('Arova Settings Page Flow', () => {
  test('loads the settings route with eyebrow and h1 in Local Mode', async ({ page }) => {
    await openSettingsInLocalMode(page);

    await expect(page.locator('#settings-eyebrow')).toContainText(/settings/i);
    await expect(
      page.getByRole('heading', { name: /shape your arova space/i })
    ).toBeVisible();
  });

  test('mode status panel is visible and shows Local Mode', async ({ page }) => {
    await openSettingsInLocalMode(page);

    await expect(page.locator('#settings-mode-panel')).toBeVisible();
    await expect(page.locator('.mode-pill--local')).toBeVisible();
    await expect(page.locator('.mode-pill--local')).toContainText(/local mode/i);
    await expect(page.locator('.mode-status-desc')).toContainText(/local mode keeps demo data/i);
  });

  test('tabs navigate between General, Appearance, and Partner sections', async ({ page }) => {
    await openSettingsInLocalMode(page);

    // General tab is active by default
    await expect(page.locator('#settings-tabs-nav')).toBeVisible();
    const generalTab = page.locator('button.tab-nav-btn:has-text("General")');
    await expect(generalTab).toHaveClass(/active/);

    // Switch to Appearance
    await page.locator('button.tab-nav-btn:has-text("Appearance")').click();
    await expect(
      page.getByRole('heading', { name: /appearance|theme/i })
    ).toBeVisible();

    // Switch to Partner & Profile
    await page.locator('button.tab-nav-btn:has-text("Partner")').click();
    await expect(
      page.getByRole('heading', { name: /partner & profile|current user/i, exact: false })
    ).toBeVisible();
  });

  test('app mode selection radios are visible in General tab', async ({ page }) => {
    await openSettingsInLocalMode(page);

    // Should show mode radio options
    const localModeOption = page.locator('.mode-option').filter({ hasText: 'Local Mode' });
    const apiModeOption = page.locator('.mode-option').filter({ hasText: 'API Mode' });

    await expect(localModeOption).toBeVisible();
    await expect(apiModeOption).toBeVisible();

    // Local Mode should be checked
    await expect(localModeOption.locator('input[type="radio"]')).toBeChecked();
  });

  test('theme selector grid appears in Appearance tab', async ({ page }) => {
    await openSettingsInLocalMode(page);

    await page.locator('button.tab-nav-btn:has-text("Appearance")').click();

    await expect(page.locator('.theme-selector-grid')).toBeVisible();
    // At least several theme options
    await expect(page.locator('.theme-select-btn')).toHaveCount(20);
  });

  test('default theme "dark-romantic" is selected', async ({ page }) => {
    await openSettingsInLocalMode(page);

    await page.locator('button.tab-nav-btn:has-text("Appearance")').click();

    const darkRomanticBtn = page.locator('button.theme-select-btn:has(.swatch-dark-romantic)');
    await expect(darkRomanticBtn).toHaveClass(/active/);
  });

  test('can select a theme and save settings', async ({ page }) => {
    await openSettingsInLocalMode(page);

    await page.locator('button.tab-nav-btn:has-text("Appearance")').click();
    await page.locator('button.theme-select-btn:has(.swatch-soft-pink)').click();
    await page.locator('button[type="submit"]').click();

    // Success message appears
    await expect(page.locator('.success-message')).toBeVisible();

    // Theme class applied to html element
    await expect(page.locator('html')).toHaveClass(/theme-soft-pink/);
  });

  test('theme persists after page reload', async ({ page }) => {
    await openSettingsInLocalMode(page);

    await page.locator('button.tab-nav-btn:has-text("Appearance")').click();
    await page.locator('button.theme-select-btn:has(.swatch-cosmic-blue)').click();
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.success-message')).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/theme-cosmic-blue/);
  });

  test('privacy/limitations section is visible in Partner tab', async ({ page }) => {
    await openSettingsInLocalMode(page);

    await page.locator('button.tab-nav-btn:has-text("Partner")').click();

    await expect(page.locator('#settings-privacy-section')).toBeVisible();
    await expect(page.locator('#settings-privacy-section')).toContainText(/localstorage/i);
    await expect(page.locator('#settings-privacy-section')).toContainText(
      /placeholder|demo/i
    );
  });

  test('no false E2EE or production security claims', async ({ page }) => {
    await openSettingsInLocalMode(page);

    // Check General tab
    const pageContent = await page.content();

    // Should NOT claim true E2EE is active
    expect(pageContent).not.toMatch(/true end-to-end encryption is (enabled|active|complete)/i);
    // Should NOT claim production messaging is live
    expect(pageContent).not.toMatch(/production messaging is (live|enabled|active)/i);
    // Should NOT claim cloud backup is available
    expect(pageContent).not.toMatch(/cloud backup (is|now) available/i);

    // Check Partner tab
    await page.locator('button.tab-nav-btn:has-text("Partner")').click();
    const partnerContent = await page.content();
    expect(partnerContent).not.toMatch(/cloud backup is available/i);
  });

  test('danger zone is visible with reset onboarding button', async ({ page }) => {
    await openSettingsInLocalMode(page);

    await page.locator('button.tab-nav-btn:has-text("Partner")').click();

    await expect(page.locator('#settings-danger-zone')).toBeVisible();
    await expect(page.locator('#reset-onboarding-btn')).toBeVisible();
    await expect(page.locator('#reset-onboarding-btn')).toContainText(/reset onboarding/i);
  });

  test('Local Mode does not make any backend API calls on settings load', async ({ page }) => {
    let backendCalled = false;
    await page.route('**/api/**', () => {
      backendCalled = true;
    });

    await openSettingsInLocalMode(page);
    await expect(
      page.getByRole('heading', { name: /shape your arova space/i })
    ).toBeVisible();
    expect(backendCalled).toBe(false);
  });

  test('has no horizontal overflow at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openSettingsInLocalMode(page);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
