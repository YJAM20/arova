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
    await expect(chatStatus).toContainText('Local Demo Chat. Real partner sync requires API Mode.');
  });

  test('textarea is enabled in Local Mode', async ({ page }) => {
    await openChatInLocalMode(page);

    await expect(page.locator('textarea')).toBeEnabled();
  });

  test('Send message button is disabled in Local Mode on empty draft', async ({ page }) => {
    await openChatInLocalMode(page);

    await expect(page.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  test('local mode warning banner is shown inside composer', async ({ page }) => {
    await openChatInLocalMode(page);

    await expect(page.locator('.local-mode-warning')).toBeVisible();
    await expect(page.locator('.local-mode-warning')).toContainText(
      /Local Demo Chat/i
    );
    await expect(page.locator('.local-mode-warning')).toContainText(
      /Messages are saved only in this browser/i
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

  test('blank message cannot be sent (button stays disabled)', async ({ page }) => {
    await openChatInLocalMode(page);

    const sendBtn = page.getByRole('button', { name: /send message/i });
    await expect(sendBtn).toBeDisabled();

    // Textarea should be enabled
    await expect(page.locator('textarea')).toBeEnabled();
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
    await expect(page.locator('.chat-status')).toContainText('Local Demo Chat. Real partner sync requires API Mode.');

    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: /quiet room for two/i })
    ).toBeVisible();
    await expect(page.locator('.chat-status')).toContainText('Local Demo Chat. Real partner sync requires API Mode.');
  });

  test('can type and send a message in Local Mode, showing own message and partner reply', async ({ page }) => {
    await openChatInLocalMode(page);

    const textarea = page.locator('textarea');
    await expect(textarea).toBeEnabled();

    // Type a message
    await textarea.fill('Hello from local universe!');
    
    // Send button should be enabled
    const sendBtn = page.getByRole('button', { name: /send message/i });
    await expect(sendBtn).toBeEnabled();

    // Click send
    await sendBtn.click();

    // Textarea should be cleared
    await expect(textarea).toHaveValue('');

    // Message list should contain the message
    const msgList = page.locator('#chat-message-list');
    await expect(msgList).toBeVisible();
    await expect(msgList).toContainText('Hello from local universe!');

    // Simulated reply from Demo Partner should appear after a short delay
    await page.waitForTimeout(1500);
    await expect(msgList).toContainText('Demo Partner');
    // It should have one of the simulated responses
    const listText = await msgList.textContent();
    const hasSimulatedReply = 
      listText?.includes('I saved this in our little orbit.') ||
      listText?.includes('That feels like something we should remember.') ||
      listText?.includes('I’m here in the demo space with you.') ||
      listText?.includes('This is local-only, but it still feels alive.');
    expect(hasSimulatedReply).toBe(true);
  });

  test('messages persist in Local Mode across page reloads', async ({ page }) => {
    await openChatInLocalMode(page);
    const textarea = page.locator('textarea');
    await textarea.fill('Persistent local note');
    await page.getByRole('button', { name: /send message/i }).click();

    // Verify it is in list
    const msgList = page.locator('#chat-message-list');
    await expect(msgList).toContainText('Persistent local note');

    // Reload the page
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Verify it is still there
    await expect(page.locator('#chat-message-list')).toContainText('Persistent local note');
  });

  test('can toggle off partner replies in Local Mode', async ({ page }) => {
    await openChatInLocalMode(page);

    // Uncheck the partner replies toggle
    const toggle = page.locator('#demo-partner-reply-toggle input[type="checkbox"]');
    await expect(toggle).toBeChecked();
    await toggle.uncheck();

    const textarea = page.locator('textarea');
    await textarea.fill('No reply expected');
    await page.getByRole('button', { name: /send message/i }).click();

    // Verify message appears
    const msgList = page.locator('#chat-message-list');
    await expect(msgList).toContainText('No reply expected');

    // Wait and verify no reply is added
    await page.waitForTimeout(1500);
    await expect(msgList).not.toContainText('Demo Partner');
  });
});
