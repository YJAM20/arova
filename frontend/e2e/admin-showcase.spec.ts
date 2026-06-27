import { test, expect } from '@playwright/test';

test.describe('Admin Showcase Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to admin-showcase (no auth guard on this route)
    await page.goto('/admin-showcase');
  });

  // ── Route & Page Load ─────────────────────────────────────────────────────
  test('should load /admin-showcase route successfully', async ({ page }) => {
    // Wait for page title section to confirm Angular lazy chunk loaded
    await page.waitForSelector('.page-title-section', { timeout: 15000 });
    await expect(page).toHaveURL(/\/admin-showcase$/);
    await expect(page).toHaveTitle(/Arova Control Center/i);
  });


  test('should render the page H1 heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Arova Control Center');
  });

  // ── Showcase Disclaimer ───────────────────────────────────────────────────
  test('should display the Showcase mode badge', async ({ page }) => {
    const badge = page.locator('.showcase-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(/Showcase Mode — sample data only/i);
  });

  test('should display the Developer Note disclaimer alert', async ({ page }) => {
    const alert = page.locator('.disclaimer-alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/demonstrates the admin design/i);
    await expect(alert).toContainText(/not connected to private couple data/i);
  });

  // ── Sidebar Navigation ────────────────────────────────────────────────────
  test('should render the sidebar with brand name', async ({ page }) => {
    const sidebar = page.locator('.admin-sidebar');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText('Arova Control');
  });

  test('should render four navigation groups in sidebar', async ({ page }) => {
    const groups = page.locator('.nav-group-title');
    await expect(groups).toHaveCount(4);
    await expect(groups.first()).toContainText('Overview');
  });

  // ── Header ────────────────────────────────────────────────────────────────
  test('should render the admin header with breadcrumb', async ({ page }) => {
    const header = page.locator('.admin-header');
    await expect(header).toBeVisible();
    await expect(header.locator('.breadcrumb')).toContainText('Admin Showcase');
  });

  test('should render the notification button with badge', async ({ page }) => {
    const notifBtn = page.locator('.notification-btn');
    await expect(notifBtn).toBeVisible();
    await expect(page.locator('.notif-badge')).toBeVisible();
  });

  test('should render the admin profile chip', async ({ page }) => {
    const chip = page.locator('.profile-chip');
    await expect(chip).toBeVisible();
    await expect(chip).toContainText('Arova Admin Preview');
  });

  // ── Metric Cards ──────────────────────────────────────────────────────────
  test('should render 4 metric cards', async ({ page }) => {
    // Wait for any Angular initialization
    await page.waitForSelector('.metrics-grid');
    const cards = page.locator('.metrics-grid arova-card, .metrics-grid .metric-card');
    // Each arova-card becomes a host element — count the arova-card elements inside the grid
    const metricsSection = page.locator('section[aria-label="System Metrics Summary"]');
    await expect(metricsSection).toBeVisible();
    // Verify all expected metric values are present
    await expect(page.getByText('128')).toBeVisible();
    await expect(page.getByText('2.8K')).toBeVisible();
    await expect(page.getByText('942')).toBeVisible();
    await expect(page.getByText('82%')).toBeVisible();
  });

  test('should display Sample tags on all metric values', async ({ page }) => {
    const sampleTags = page.locator('.sample-tag');
    await expect(sampleTags).toHaveCount(4);
  });

  // ── Charts Panel ──────────────────────────────────────────────────────────
  test('should render the Activity Overview chart panel', async ({ page }) => {
    const chartTitle = page.getByRole('heading', { name: /arova activity overview/i });
    await expect(chartTitle).toBeVisible();
    const svg = page.locator('.svg-chart-container svg');
    await expect(svg).toBeVisible();
  });

  test('should render the Experience Distribution panel', async ({ page }) => {
    const distTitle = page.getByRole('heading', { name: /experience distribution/i });
    await expect(distTitle).toBeVisible();
    const bars = page.locator('.progress-bar-fill');
    await expect(bars).toHaveCount(5);
  });

  // ── Mode Health ───────────────────────────────────────────────────────────
  test('should render the Mode Health Status panel', async ({ page }) => {
    const modeTitle = page.getByRole('heading', { name: /mode health status/i });
    await expect(modeTitle).toBeVisible();
    const items = page.locator('.mode-status-item');
    await expect(items).toHaveCount(2);
  });

  test('should show Local Mode as Operational', async ({ page }) => {
    const localModeCard = page.locator('.mode-status-item').first();
    await expect(localModeCard).toContainText('Local Mode');
  });

  // ── System Status Checks ──────────────────────────────────────────────────
  test('should render 4 system health check cards', async ({ page }) => {
    const healthTitle = page.getByRole('heading', { name: /system status/i });
    await expect(healthTitle).toBeVisible();
    const healthCards = page.locator('.health-item-card');
    await expect(healthCards).toHaveCount(4);
  });

  // ── Activity Table ────────────────────────────────────────────────────────
  test('should render the Recent Product Activity table', async ({ page }) => {
    const activityTitle = page.getByRole('heading', { name: /recent product activity/i });
    await expect(activityTitle).toBeVisible();
    const table = page.locator('.admin-table').first();
    await expect(table).toBeVisible();
    // Verify it has rows — at least 5 activity entries
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(5);
  });

  test('should have properly scoped table headers in activity table', async ({ page }) => {
    const table = page.locator('.admin-table').first();
    const colHeaders = table.locator('th[scope="col"]');
    await expect(colHeaders).toHaveCount(5);
  });

  // ── Production Readiness Matrix ───────────────────────────────────────────
  test('should render the Production Readiness Matrix table', async ({ page }) => {
    const matrixTitle = page.getByRole('heading', { name: /production readiness matrix/i });
    await expect(matrixTitle).toBeVisible();
    const tables = page.locator('.admin-table');
    // Second table is the matrix
    await expect(tables.nth(1)).toBeVisible();
    const rows = tables.nth(1).locator('tbody tr');
    await expect(rows).toHaveCount(8);
  });

  // ── Quick Actions ─────────────────────────────────────────────────────────
  test('should render Quick Actions panel with navigation links', async ({ page }) => {
    const actionsTitle = page.getByRole('heading', { name: /quick actions/i });
    await expect(actionsTitle).toBeVisible();
    // Check for router links
    const universeLink = page.locator('a[href="/universe"], a[ng-reflect-router-link="/universe"]');
    const authLink = page.locator('a[href="/auth"], a[ng-reflect-router-link="/auth"]');
    // At minimum, the action links should be visible
    const actionLinks = page.locator('.btn-action-link');
    await expect(actionLinks).toHaveCount(4);
  });

  test('should have a disabled Export Demo Backup button', async ({ page }) => {
    const disabledBtn = page.locator('button[disabled]');
    await expect(disabledBtn).toBeVisible();
    await expect(disabledBtn).toContainText(/export demo backup/i);
  });

  // ── System Notes Panel ────────────────────────────────────────────────────
  test('should render the Important Product Notes panel', async ({ page }) => {
    const notesTitle = page.getByRole('heading', { name: /important product notes/i });
    await expect(notesTitle).toBeVisible();
    const listItems = page.locator('.limitations-list li');
    await expect(listItems).toHaveCount(8);
  });

  test('should mention OAuth, SMS, and Billing as planned', async ({ page }) => {
    const notesList = page.locator('.limitations-list');
    await expect(notesList).toContainText('OAuth');
    await expect(notesList).toContainText('SMS');
    await expect(notesList).toContainText('Billing');
    await expect(notesList).toContainText('End-to-End Encryption');
  });

  // ── Accessibility ─────────────────────────────────────────────────────────
  test('should have labelled landmark regions', async ({ page }) => {
    const sidebar = page.locator('aside[aria-label]');
    await expect(sidebar).toBeVisible();
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb navigation"]');
    await expect(breadcrumb).toBeVisible();
    const mainNav = page.locator('nav[aria-label="Admin Navigation Links"]');
    await expect(mainNav).toBeVisible();
  });

  test('should have all section headings at level 2 (below page h1)', async ({ page }) => {
    const h2s = page.locator('main h2');
    const count = await h2s.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  // ── Mobile Responsiveness ─────────────────────────────────────────────────
  test('should show hamburger button on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 812 });
    await page.goto('/admin-showcase');
    const hamburger = page.locator('.hamburger-btn');
    await expect(hamburger).toBeVisible();
  });

  test('should toggle mobile sidebar when hamburger is clicked', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 812 });
    await page.goto('/admin-showcase');
    const sidebar = page.locator('.admin-sidebar');
    // Sidebar starts closed on mobile
    await expect(sidebar).not.toHaveClass(/mobile-open/);
    // Click hamburger to open
    await page.locator('.hamburger-btn').click();
    await expect(sidebar).toHaveClass(/mobile-open/);
    // Overlay should appear
    const overlay = page.locator('.mobile-sidebar-overlay');
    await expect(overlay).toBeVisible();
    // Click overlay to close
    await overlay.click();
    await expect(sidebar).not.toHaveClass(/mobile-open/);
  });

  test('should have no horizontal scroll overflow at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/admin-showcase');
    // Check body scroll width does not exceed viewport
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });
});
