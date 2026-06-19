import { test, expect, Page, Route } from '@playwright/test';

const apiJsonHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

function fulfillApiJson(route: Route, status: number, body: unknown) {
  if (route.request().method() === 'OPTIONS') {
    return route.fulfill({
      status: 204,
      headers: apiJsonHeaders,
      body: '',
    });
  }

  return route.fulfill({
    status,
    contentType: 'application/json',
    headers: apiJsonHeaders,
    body: JSON.stringify(body),
  });
}

async function seedLocalSetup(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('love-universe-app-mode', 'local');

    const owner = {
      id: 'user-owner',
      username: 'owner',
      passcode: '1234',
      displayName: 'Partner A',
      role: 'admin',
    };

    localStorage.setItem('love-universe-session-v1', JSON.stringify(owner));
    localStorage.setItem('love-universe-data-v1', JSON.stringify({
      version: '1.0.0',
      settings: {
        activeTheme: 'dark-romantic',
        languageMode: 'en',
        animationsEnabled: true,
        musicEnabled: false,
        onboardingCompleted: false,
      },
      users: [
        owner,
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
    }));
  });
}

async function seedApiSetup(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('love-universe-app-mode', 'api');
    localStorage.setItem('love-universe-api-token', 'dummy-token');
  });
}

async function gotoLocalOnboarding(page: Page) {
  await seedLocalSetup(page);
  await page.goto('/onboarding/questions');
}

async function gotoApiOnboarding(page: Page) {
  await page.route('**/api/auth/me**', route => {
    fulfillApiJson(route, 200, {
      id: 'api-user',
      username: 'api-user',
      displayName: 'API Partner',
      role: 'admin',
    });
  });
  await seedApiSetup(page);
  await page.goto('/onboarding/questions');
}

test.describe('Arova Onboarding Questions', () => {
  test('loads, answers questions, supports back, and finishes in Local Mode without backend', async ({ page }) => {
    let onboardingApiRequests = 0;
    await page.route('**/api/onboarding/**', route => {
      onboardingApiRequests++;
      route.abort();
    });

    await gotoLocalOnboarding(page);

    await expect(page).toHaveURL(/\/onboarding\/questions$/);
    await expect(page.getByRole('heading', { name: /shape your private space/i })).toBeVisible();
    await expect(page.getByText(/question 1 of 7/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /what kind of small ritual/i })).toBeVisible();

    await page.getByLabel('A daily check-in').check();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByText(/question 2 of 7/i)).toBeVisible();
    await page.getByLabel(/your answer/i).fill('First date memories and quiet weekend photos.');

    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByText(/question 1 of 7/i)).toBeVisible();
    await expect(page.getByLabel('A daily check-in')).toBeChecked();

    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByLabel(/your answer/i)).toHaveValue('First date memories and quiet weekend photos.');

    for (let step = 0; step < 10; step++) {
      const continueButton = page.getByRole('button', { name: /continue/i });
      if ((await continueButton.count()) === 0) break;
      await continueButton.click();
    }

    await expect(page.getByRole('button', { name: /finish setup/i })).toBeVisible();
    await page.getByRole('button', { name: /finish setup/i }).click();
    await page.waitForURL('**/profile-setup');

    const savedAnswers = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('arova-local-onboarding-answers-v1') || '[]')
    );
    expect(savedAnswers).toEqual(expect.arrayContaining([
      { questionId: 'rhythm', answer: 'A daily check-in' },
      { questionId: 'memory', answer: 'First date memories and quiet weekend photos.' },
    ]));
    expect(onboardingApiRequests).toBe(0);
  });

  test('shows loading state while API questions are preparing', async ({ page }) => {
    await page.route('**/api/onboarding/questions**', async route => {
      if (route.request().method() !== 'OPTIONS') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      await fulfillApiJson(route, 200, [
        { id: 'tone', prompt: 'What tone should Arova use?', category: 'Tone', options: ['Calm', 'Practical'] },
      ]);
    });
    await page.route('**/api/onboarding/my-answers**', route => {
      fulfillApiJson(route, 200, []);
    });

    await gotoApiOnboarding(page);

    await expect(page.getByText(/preparing your onboarding questions/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /what tone should arova use/i })).toBeVisible();
  });

  test('shows empty state when API returns no questions', async ({ page }) => {
    await page.route('**/api/onboarding/questions**', route => {
      fulfillApiJson(route, 200, []);
    });

    await gotoApiOnboarding(page);

    await expect(page.getByText(/no onboarding questions are available right now/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /continue to profile setup/i })).toBeVisible();
  });

  test('shows honest error state when API questions cannot load', async ({ page }) => {
    await page.route('**/api/onboarding/questions**', route => {
      fulfillApiJson(route, 500, { message: 'offline' });
    });

    await gotoApiOnboarding(page);

    await expect(page.getByRole('alert')).toContainText(/we could not load onboarding right now/i);
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  });

  test('has no horizontal overflow at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await gotoLocalOnboarding(page);

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 5);
  });
});
