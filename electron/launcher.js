const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const STEP_TIMEOUT = 30000; // 30 seconds per step

/**
 * Get the profile directory path for an account.
 * Creates the directory if it doesn't exist.
 */
function getProfilePath(accountId) {
  const profilesDir = path.join(app.getPath('userData'), 'profiles', accountId);
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
  }
  return profilesDir;
}

/**
 * Delete the profile directory for an account.
 */
function deleteProfile(accountId) {
  const profilesDir = path.join(app.getPath('userData'), 'profiles', accountId);
  if (fs.existsSync(profilesDir)) {
    fs.rmSync(profilesDir, { recursive: true, force: true });
  }
}

/**
 * Determine which browser channel to use.
 * macOS dev: 'chrome' (Edge isn't always available)
 * Windows: 'msedge'
 */
function getBrowserChannel() {
  if (process.platform === 'win32') return 'msedge';
  // On macOS, try Edge first, fall back to Chrome for dev
  return 'chrome';
}

/**
 * Launch an account: open Edge with isolated profile, detect login scenario,
 * fill credentials if needed, then detach.
 *
 * @param {Object} account - Full account object (with password)
 * @param {Object} destination - { id, label, url }
 * @param {Function} onStatus - Callback: ({ id, status, error? }) => void
 */
async function launchAccount(account, destination, onStatus) {
  const profilePath = getProfilePath(account.id);
  const channel = getBrowserChannel();
  let browser = null;

  try {
    onStatus({ id: account.id, status: 'launching' });

    // Launch browser with isolated profile
    browser = await chromium.launch({
      channel,
      headless: false,
      args: [
        `--user-data-dir=${profilePath}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-popup-blocking',
      ],
    });

    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();

    // Navigate to destination
    await page.goto(destination.url, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT });

    // Scenario detection via Promise.race
    const scenario = await detectScenario(page);

    if (scenario === 'login-required') {
      await fillCredentials(page, account);
    } else if (scenario === 'stale-session') {
      // Click "Use another account" then fill credentials
      await page.click('text=Use another account', { timeout: STEP_TIMEOUT });
      await fillCredentials(page, account);
    }
    // scenario === 'session-alive' means we're already logged in — nothing to do

    // Wait briefly for the destination page to settle
    await page.waitForTimeout(2000);

    onStatus({ id: account.id, status: 'open' });
  } catch (err) {
    onStatus({ id: account.id, status: 'error', error: err.message });
  } finally {
    // Detach: close Playwright's connection but leave the browser open
    if (browser) {
      try {
        // browser.close() closes Playwright's CDP connection.
        // The browser process stays alive because we launched with persistent context flags.
        await browser.close();
      } catch {
        // Browser may already be disconnected — that's fine
      }
    }
  }
}

/**
 * Detect which login scenario we're in after navigating to the destination.
 *
 * A — Session alive: destination content is visible
 * B — Login required: username input is visible
 * C — Stale session: account picker is visible
 */
async function detectScenario(page) {
  const result = await Promise.race([
    // Scenario A: Session alive — look for common M365 app indicators
    page.waitForSelector('[data-app-name], #O365_MainLink_NavMenu, .ms-Persona, [class*="copilot"], #app', { timeout: STEP_TIMEOUT })
      .then(() => 'session-alive')
      .catch(() => null),

    // Scenario B: Login required — Microsoft login form
    page.waitForSelector('input[name="loginfmt"]', { timeout: STEP_TIMEOUT })
      .then(() => 'login-required')
      .catch(() => null),

    // Scenario C: Stale session — account picker
    page.waitForSelector('#otherTileText, [data-test-id="otherTile"], text=Use another account', { timeout: STEP_TIMEOUT })
      .then(() => 'stale-session')
      .catch(() => null),
  ]);

  return result || 'login-required'; // Default to login if nothing matched
}

/**
 * Fill the Microsoft login form.
 * username → Next → password → Sign In → Stay signed in? → Yes
 */
async function fillCredentials(page, account) {
  // Wait for and fill username
  await page.waitForSelector('input[name="loginfmt"]', { timeout: STEP_TIMEOUT });
  await page.fill('input[name="loginfmt"]', account.username);
  await page.click('input[type="submit"]');

  // Wait for and fill password
  await page.waitForSelector('input[name="passwd"]', { timeout: STEP_TIMEOUT });
  await page.fill('input[name="passwd"]', account.password);
  await page.click('input[type="submit"]');

  // Handle "Stay signed in?" prompt if it appears
  try {
    await page.waitForSelector('#idSIButton9, input[value="Yes"], text=Yes', { timeout: 10000 });
    await page.click('#idSIButton9, input[value="Yes"], text=Yes');
  } catch {
    // Prompt may not appear (e.g. if previously accepted) — that's fine
  }

  // Wait for navigation to complete after login
  try {
    await page.waitForLoadState('domcontentloaded', { timeout: STEP_TIMEOUT });
  } catch {
    // May already be loaded
  }
}

module.exports = {
  launchAccount,
  getProfilePath,
  deleteProfile,
};
