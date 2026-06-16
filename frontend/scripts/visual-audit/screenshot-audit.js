const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const routes = [
  { name: 'landing', path: '/' },
  { name: 'auth', path: '/auth' },
  { name: 'universe', path: '/universe' },
  { name: 'planets', path: '/planets' },
  { name: 'profile', path: '/profile' },
  { name: 'custom_sections', path: '/custom-sections' },
  { name: 'admin', path: '/admin' },
  { name: 'settings', path: '/settings' },
  { name: 'chat', path: '/chat' },
  { name: 'music', path: '/music' },
  { name: 'mood', path: '/mood' },
  { name: 'letters', path: '/letters' },
  { name: 'reasons', path: '/reasons' },
  { name: 'memories', path: '/memories' },
  { name: 'future', path: '/future' },
  { name: 'challenges', path: '/challenges' },
  { name: 'daily_questions', path: '/daily-questions' },
  { name: 'check_in', path: '/check-in' },
  { name: 'couple_profile', path: '/couple-profile' },
  { name: 'not_found', path: '/non-existing-route' }
];

async function run() {
  const outputDir = path.join(__dirname, '..', '..', 'visual-audit', 'latest');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('Navigating to landing page...');
  await page.goto('http://localhost:4200/');
  await page.waitForTimeout(2000);

  let url = page.url();
  console.log(`Current URL: ${url}`);

  // Perform login if redirected or needed
  if (url.includes('/auth') || url.includes('/404') || (!url.includes('/universe') && !url.includes('/onboarding'))) {
    console.log('Not logged in. Navigating to /auth/login...');
    await page.goto('http://localhost:4200/auth/login');
    await page.waitForTimeout(1500);
    console.log('Entering local owner credentials...');
    await page.fill('#username', 'owner');
    await page.fill('#passcode', '1234');
    await page.click('.login-btn');
    await page.waitForTimeout(3000);
    url = page.url();
    console.log(`Logged in. Current URL: ${url}`);
  }

  // Handle onboarding skip button if redirected
  if (url.includes('/onboarding') || url.includes('/couple-setup')) {
    console.log('Detected onboarding page. Bypassing with skip-for-demo...');
    try {
      await page.click('button:has-text("Skip for demo mode")');
      await page.waitForTimeout(3000);
      console.log(`Bypassed setup. Current URL: ${page.url()}`);
    } catch (e) {
      console.log('Skip button not found or already skipped:', e.message);
    }
  }

  // Capture each route
  for (const route of routes) {
    console.log(`Auditing route: ${route.name} (${route.path})`);
    try {
      await page.goto(`http://localhost:4200${route.path}`);
      await page.waitForTimeout(2000); // Allow styles and mesh gradient to load

      // Skip onboarding again if we get kicked back to it on some routes
      const currentUrl = page.url();
      if (currentUrl.includes('/onboarding') || currentUrl.includes('/couple-setup')) {
        console.log(`Kicked to setup. Skipping...`);
        await page.click('button:has-text("Skip for demo mode")');
        await page.waitForTimeout(2000);
      }

      const screenshotPath = path.join(outputDir, `audit_${route.name}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot: ${screenshotPath}`);
    } catch (routeErr) {
      console.error(`Failed to capture route ${route.name}:`, routeErr.message);
    }
  }

  await browser.close();
  console.log('Visual audit capture session finished successfully.');
}

run().catch(err => {
  console.error('Visual audit execution failed:', err);
  process.exit(1);
});
