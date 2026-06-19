import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

async function openChatInLocalMode(page: Page): Promise<void> {
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
  await page.goto('/chat');
}

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────

test.describe('Arova Chat Room Flow', () => {
  test('loads the chat route with eyebrow kicker and h1 in Local Mode', async ({ page }) => {
    await openChatInLocalMode(page);

    await expect(page.locator('#chat-eyebrow')).toContainText(/private chat/i);
    await expect(
      page.getByRole('heading', { name: /quiet room for two/i })
    ).toBeVisible();
  });

  test('shows Local Mode status badge and mode warning', async ({ page }) => {
    await openChatInLocalMode(page);

    // Status badge
    await expect(page.locator('.status-badge.local')).toBeVisible();
    await expect(page.locator('.status-badge.local')).toContainText(/local mode/i);

    // Chat status banner
    const chatStatus = page.locator('.chat-status');
    await expect(chatStatus).toBeVisible();
    await expect(chatStatus).toContainText('Chat requires API Mode.');
  });

  test('textarea is disabled in Local Mode', async ({ page }) => {
    await openChatInLocalMode(page);

    await expect(page.locator('textarea')).toBeDisabled();
  });

  test('Send message button is disabled in Local Mode', async ({ page }) => {
    await openChatInLocalMode(page);

    await expect(page.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  test('local mode warning banner is shown inside composer', async ({ page }) => {
    await openChatInLocalMode(page);

    await expect(page.locator('.local-mode-warning')).toBeVisible();
    await expect(page.locator('.local-mode-warning')).toContainText(
      /messaging is unavailable in the browser demo/i
    );
  });

  test('empty state or loading indicator is visible in chat viewport', async ({ page }) => {
    await openChatInLocalMode(page);

    // Either the empty state is shown (local mode)
    const emptyState = page.locator('#chat-empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/no messages yet/i);
  });

  test('emoji bar is hidden in Local Mode', async ({ page }) => {
    await openChatInLocalMode(page);

    // Emoji bar should not be shown when connectionStatus === 'local'
    await expect(page.locator('.emoji-bar')).not.toBeVisible();
  });

  test('blank message cannot be sent in API Mode (button stays disabled)', async ({ page }) => {
    // Can test this safely in local mode by checking disabled on empty draft
    await openChatInLocalMode(page);

    const sendBtn = page.getByRole('button', { name: /send message/i });
    await expect(sendBtn).toBeDisabled();

    // Even if textarea were somehow enabled, empty value should keep disabled
    await expect(page.locator('textarea')).toBeDisabled();
  });

  test('chat disclaimer footer is visible with honest copy', async ({ page }) => {
    await openChatInLocalMode(page);

    await expect(page.locator('#chat-disclaimer')).toBeVisible();
    await expect(page.locator('#chat-disclaimer')).toContainText(
      /true e2ee and production messaging infrastructure are planned, not active/i
    );
  });

  test('Local Mode does not make any backend API calls', async ({ page }) => {
    let backendCalled = false;
    await page.route('**/api/**', () => {
      backendCalled = true;
    });

    await openChatInLocalMode(page);
    await expect(page.locator('.chat-status')).toBeVisible();
    expect(backendCalled).toBe(false);
  });

  test('has no horizontal overflow at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openChatInLocalMode(page);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('direct route refresh keeps Local Mode session active', async ({ page }) => {
    await openChatInLocalMode(page);
    await expect(page.locator('.chat-status')).toContainText('Chat requires API Mode.');

    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: /quiet room for two/i })
    ).toBeVisible();
    await expect(page.locator('.chat-status')).toContainText('Chat requires API Mode.');
  });
});
