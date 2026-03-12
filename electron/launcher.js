const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const STEP_TIMEOUT = 30000; // 30 seconds per step

/**
 * Get the profile directory path for an account, namespaced by browser channel.
 * Creates the directory if it doesn't exist.
 *
 * Structure: profiles/<channel>/<account-id>/
 * This ensures switching browsers doesn't corrupt profiles — cookies are
 * encrypted per-browser and aren't portable between Chrome and Edge.
 */
function getProfilePath(accountId, channel) {
  // Sanitize inputs to prevent path traversal
  const safeId = path.basename(accountId);
  const safeChannel = path.basename(channel);
  const profilesDir = path.join(app.getPath('userData'), 'profiles', safeChannel, safeId);
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
  }
  return profilesDir;
}

/**
 * Delete the profile directories for an account across all browser channels.
 * Called when an account is removed from settings.
 */
function deleteProfile(accountId) {
  const channels = ['chrome', 'msedge'];
  for (const channel of channels) {
    const profileDir = path.join(app.getPath('userData'), 'profiles', channel, accountId);
    if (fs.existsSync(profileDir)) {
      fs.rmSync(profileDir, { recursive: true, force: true });
    }
  }
}

/**
 * Launch an account: open browser with isolated profile, detect login scenario,
 * fill credentials if needed, then detach.
 *
 * @param {Object} account - Full account object (with password)
 * @param {Object} destination - { id, label, url }
 * @param {string} channel - Browser channel: 'chrome' or 'msedge'
 * @param {Function} onStatus - Callback: ({ id, status, error? }) => void
 */
async function launchAccount(account, destination, channel, onStatus) {
  const profilePath = getProfilePath(account.id, channel);
  let browser = null;

  try {
    onStatus({ id: account.id, status: 'launching' });

    // Launch browser with isolated persistent profile
    // We use launchPersistentContext for profile isolation, then detach
    // by disconnecting the CDP session (browser stays open).
    browser = await chromium.launchPersistentContext(profilePath, {
      channel,
      headless: false,
      args: [
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-popup-blocking',
      ],
    });

    const page = browser.pages()[0] || await browser.newPage();

    // Navigate to destination
    await page.goto(destination.url, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT });

    // Scenario detection via Promise.race
    const scenario = await detectScenario(page);

    if (scenario === 'login-required') {
      await fillCredentials(page, account);
    } else if (scenario === 'stale-session') {
      // Account picker is showing — click "Use another account" to get to the login form.
      // Microsoft uses several variations of this button/link.
      await clickUseAnotherAccount(page);
      await fillCredentials(page, account);
    }
    // scenario === 'session-alive' means we're already logged in — nothing to do

    // Wait briefly for the destination page to settle
    await page.waitForTimeout(2000);

    onStatus({ id: account.id, status: 'open' });
  } catch (err) {
    onStatus({ id: account.id, status: 'error', error: err.message });
  } finally {
    // Detach: do NOT call browser.close() — that would kill the browser.
    // Instead, just let the reference go. The browser process stays alive
    // as a normal user-controlled window. Playwright's CDP connection
    // will be garbage collected without affecting the browser.
    browser = null;
  }
}

/**
 * Detect which login scenario we're in after navigating to the destination.
 *
 * A — Session alive: destination content is visible
 * B — Login required: username input is visible
 * C — Stale session: account picker is visible (shows existing accounts + "Use another account")
 */
async function detectScenario(page) {
  const result = await Promise.race([
    page.waitForSelector('[data-app-name], #O365_MainLink_NavMenu, .ms-Persona, [class*="copilot"], #app', { timeout: STEP_TIMEOUT })
      .then(() => 'session-alive')
      .catch(() => null),

    page.waitForSelector('input[name="loginfmt"]', { timeout: STEP_TIMEOUT })
      .then(() => 'login-required')
      .catch(() => null),

    // Account picker — Microsoft uses many variants of this screen:
    // - #otherTileText ("Use another account" text)
    // - .table[data-test-id="accountList"] (account list container)
    // - #tilesHolder (tile container with existing accounts)
    // - #otherTile (the "Use another account" tile itself)
    // - Text match as fallback
    page.waitForSelector('#otherTileText, #otherTile, [data-test-id="otherTile"], #tilesHolder, text=Use another account, text=Sign in with a different account', { timeout: STEP_TIMEOUT })
      .then(() => 'stale-session')
      .catch(() => null),
  ]);

  return result || 'login-required';
}

/**
 * Click "Use another account" on the Microsoft account picker.
 * Handles multiple layout variants Microsoft uses for this screen.
 */
async function clickUseAnotherAccount(page) {
  // Try multiple selectors — Microsoft changes these across tenants and updates
  const selectors = [
    '#otherTile',
    '#otherTileText',
    '[data-test-id="otherTile"]',
    'text=Use another account',
    'text=Sign in with a different account',
  ];

  for (const selector of selectors) {
    try {
      const el = await page.$(selector);
      if (el) {
        await el.click();
        // Wait for the login form to appear after clicking
        await page.waitForSelector('input[name="loginfmt"]', { timeout: STEP_TIMEOUT });
        return;
      }
    } catch {
      // Try next selector
    }
  }

  // Last resort: if nothing matched, the page might have navigated already
  // Check if login form appeared on its own
  try {
    await page.waitForSelector('input[name="loginfmt"]', { timeout: 5000 });
  } catch {
    throw new Error('Could not find "Use another account" button on the account picker screen');
  }
}

/**
 * Fill the Microsoft login form.
 * username → Next → password → Sign In → Stay signed in? → Yes
 */
async function fillCredentials(page, account) {
  await page.waitForSelector('input[name="loginfmt"]', { timeout: STEP_TIMEOUT });
  await page.fill('input[name="loginfmt"]', account.username);
  await page.click('input[type="submit"]');

  await page.waitForSelector('input[name="passwd"]', { timeout: STEP_TIMEOUT });
  await page.fill('input[name="passwd"]', account.password);
  await page.click('input[type="submit"]');

  try {
    await page.waitForSelector('#idSIButton9, input[value="Yes"], text=Yes', { timeout: 10000 });
    await page.click('#idSIButton9, input[value="Yes"], text=Yes');
  } catch {
    // Prompt may not appear — that's fine
  }

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
