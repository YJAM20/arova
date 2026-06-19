import { expect, Page, test } from '@playwright/test';

const apiCorsHeaders = {
  'access-control-allow-origin': 'http://localhost:4200',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

async function openPairingInLocalMode(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as Window & { __copiedText?: string }).__copiedText = value;
        },
      },
    });
  });

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
          onboardingCompleted: false,
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

  await page.goto('/pairing-choice');
}

async function openPairingInApiMode(page: Page): Promise<void> {
  await page.goto('/auth');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('love-universe-app-mode', 'api');
    localStorage.setItem('love-universe-api-token', 'dummy-token');
  });
  await page.goto('/pairing-choice');
}

test.describe('Arova pairing choice flow', () => {
  test('loads the pairing route with the main heading and both primary options', async ({ page }) => {
    await openPairingInLocalMode(page);

    await expect(page.getByRole('heading', { name: /create your private space for two/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create a shared space/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /join with a code/i })).toBeVisible();
    await expect(page.getByText(/in local mode, pairing is simulated/i)).toBeVisible();
  });

  test('updates selected state, creates a local demo pairing code, and supports copy', async ({ page }) => {
    await openPairingInLocalMode(page);

    const joinOption = page.getByRole('button', { name: /join with a code/i });
    const createOption = page.getByRole('button', { name: /create a shared space/i });

    await joinOption.click();
    await expect(joinOption).toHaveAttribute('aria-pressed', 'true');

    await createOption.click();
    await expect(createOption).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: /^create shared space$/i }).click();

    await expect(page.getByText(/your pairing code/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /your shared space is ready/i })).toBeVisible();

    await page.getByRole('button', { name: /copy pairing code/i }).click();
    await expect(page.getByRole('button', { name: /copy pairing code/i })).toContainText('Copied');

    const copied = await page.evaluate(() => (window as Window & { __copiedText?: string }).__copiedText);
    expect(copied).toMatch(/^AROVA-DEMO-/);
  });

  test('reveals join input, keeps empty join disabled, and completes local demo pairing', async ({ page }) => {
    await openPairingInLocalMode(page);

    await page.getByRole('button', { name: /join with a code/i }).click();

    const codeInput = page.getByLabel(/pairing code/i);
    await expect(codeInput).toBeVisible();

    const joinButton = page.getByRole('button', { name: /^join space$/i });
    await expect(joinButton).toBeDisabled();

    await codeInput.fill('AROVA-DEMO-1234');
    await expect(joinButton).toBeEnabled();
    await joinButton.click();

    await expect(page.getByRole('heading', { name: /your shared space is ready/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /enter arova/i })).toBeVisible();
  });

  test('preserves API Mode pairing calls without faking backend success', async ({ page }) => {
    await page.route('http://localhost:5036/api/auth/me', route => {
      if (route.request().method() === 'OPTIONS') {
        route.fulfill({ status: 204, headers: apiCorsHeaders });
        return;
      }

      route.fulfill({
        status: 200,
        headers: { ...apiCorsHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'api-user-1',
          displayName: 'API User',
          username: 'apiuser',
          email: 'api@example.com',
        }),
      });
    });

    await page.route('http://localhost:5036/api/couples/pairing-code', route => {
      if (route.request().method() === 'OPTIONS') {
        route.fulfill({ status: 204, headers: apiCorsHeaders });
        return;
      }

      route.fulfill({
        status: 200,
        headers: { ...apiCorsHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({
          code: 'API-PAIR-1234',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        }),
      });
    });

    await page.route('http://localhost:5036/api/couples', route => {
      if (route.request().method() === 'OPTIONS') {
        route.fulfill({ status: 204, headers: apiCorsHeaders });
        return;
      }

      route.fulfill({
        status: 200,
        headers: { ...apiCorsHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'api-couple-1',
          name: 'Arova Space',
          isActive: true,
          createdAt: new Date().toISOString(),
        }),
      });
    });

    await openPairingInApiMode(page);
    await expect(page.getByText(/in api mode, pairing uses/i)).toBeVisible();

    await page.getByRole('button', { name: /^create shared space$/i }).click();

    await expect(page.getByText('API-PAIR-1234')).toBeVisible();
    await expect(page.getByRole('heading', { name: /your shared space is ready/i })).toBeVisible();
  });

  test('has no horizontal overflow at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openPairingInLocalMode(page);

    await expect(page.getByRole('heading', { name: /create your private space for two/i })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
