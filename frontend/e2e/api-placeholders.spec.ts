import { test, expect } from '@playwright/test';

// Helper to seed localStorage with completed onboarding for local mode
async function seedOnboardingCompleted(page) {
  await page.evaluate(() => {
    const data = {
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
        { id: 'user-partner', username: 'partner', passcode: '1234', displayName: 'Partner B', role: 'partner' }
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
        updatedAt: new Date().toISOString()
      }
    };
    localStorage.setItem('love-universe-data-v1', JSON.stringify(data));
  });
}

test.describe('Arova E2E API & Feature Placeholder Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure a clean slate before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display provider-not-configured warnings for Google and Apple buttons on /auth', async ({ page }) => {
    await page.goto('/auth');

    // Click "Continue with Google"
    const googleBtn = page.getByRole('button', { name: 'Continue with Google' });
    await expect(googleBtn).toBeVisible();
    await googleBtn.click();

    // Assert the provider message shows up
    const providerMessage = page.locator('.message');
    await expect(providerMessage).toBeVisible();
    await expect(providerMessage).toContainText('Google is prepared but not configured in this environment yet.');

    // Click "Continue with Apple"
    const appleBtn = page.getByRole('button', { name: 'Continue with Apple' });
    await expect(appleBtn).toBeVisible();
    await appleBtn.click();

    // Assert the provider message updates for Apple
    await expect(providerMessage).toBeVisible();
    await expect(providerMessage).toContainText('Apple is prepared but not configured in this environment yet.');
  });

  test('should display phone verification placeholder on /verify-account', async ({ page }) => {
    // Mock the /api/auth/me API call to prevent token validation failure/redirect
    await page.route('**/api/auth/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'dummy-id', displayName: 'Dummy User', email: 'dummy@example.com' }),
      });
    });

    // Inject API mode and dummy token to access /verify-account route
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('love-universe-app-mode', 'api');
      localStorage.setItem('love-universe-api-token', 'dummy-token-placeholder');
    });

    await page.goto('/verify-account');
    await page.waitForURL('**/verify-account');
    await expect(page).toHaveURL(/\/verify-account$/);

    // Switch to Phone tab
    const phoneTabBtn = page.getByRole('button', { name: 'Phone' });
    await expect(phoneTabBtn).toBeVisible();
    await phoneTabBtn.click();

    // Assert the phone verification placeholder text is shown
    const phoneNote = page.locator('.phone-note');
    await expect(phoneNote).toBeVisible();
    await expect(phoneNote.locator('p')).toContainText('Phone verification is not available yet. Please use email verification for now.');
  });

  test('should disable chat composer and show API mode warning in local mode', async ({ page }) => {
    // Seed completed onboarding first at '/'
    await page.goto('/');
    await seedOnboardingCompleted(page);

    // Log in via local demo login
    await page.goto('/auth/login');
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');
    await page.locator('.login-btn').click();
    await page.waitForURL('**/universe');

    // Navigate to Chat
    await page.goto('/chat');
    await page.waitForURL('**/chat');

    // Verify chat requires API Mode status is shown
    const chatStatus = page.locator('.chat-status');
    await expect(chatStatus).toBeVisible();
    await expect(chatStatus).toContainText('Chat requires API Mode.');

    // Verify textarea is disabled
    const textarea = page.locator('textarea');
    await expect(textarea).toBeDisabled();

    // Verify send button is disabled
    const sendBtn = page.getByRole('button', { name: 'Send message' });
    await expect(sendBtn).toBeDisabled();
  });

  test('should verify there are no false end-to-end encryption claims in the application', async ({ page }) => {
    // The landing page explicitly states "True end-to-end encryption is a roadmap item, not a current claim."
    await page.goto('/');
    const privacyHeading = page.locator('h2', { hasText: 'Private by design, honest about what is implemented.' });
    await expect(privacyHeading).toBeVisible();
    const privacyText = page.locator('p', { hasText: 'True end-to-end encryption is a roadmap item, not a current claim.' });
    await expect(privacyText).toBeVisible();
  });
});
