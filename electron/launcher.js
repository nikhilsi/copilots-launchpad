const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const logger = require('./logger');

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
    try {
      browser = await chromium.launchPersistentContext(profilePath, {
        channel,
        headless: false,
        args: [
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-popup-blocking',
        ],
      });
    } catch (launchErr) {
      // If a stale SingletonLock is blocking us, remove it and retry once
      if (launchErr.message.includes('ProcessSingleton')) {
        const lockFile = path.join(profilePath, 'SingletonLock');
        if (fs.existsSync(lockFile)) {
          logger.log(`[launch] Removing stale SingletonLock: ${lockFile}`);
          fs.unlinkSync(lockFile);
          browser = await chromium.launchPersistentContext(profilePath, {
            channel,
            headless: false,
            args: [
              '--no-first-run',
              '--no-default-browser-check',
              '--disable-popup-blocking',
            ],
          });
        } else {
          throw launchErr;
        }
      } else {
        throw launchErr;
      }
    }

    const page = browser.pages()[0] || await browser.newPage();

    // Navigate to destination
    await page.goto(destination.url, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT });

    // Scenario detection via Promise.race
    const scenario = await detectScenario(page);

    if (scenario === 'sign-in-button') {
      // Destination page has a "Sign in" button — click it to trigger the login redirect
      const signInBtn = await page.$('a:has-text("Sign in"), button:has-text("Sign in")');
      if (signInBtn) {
        logger.log('[launch] Clicking Sign in button on destination page');
        await signInBtn.click();
        // Wait for the login page to load, then re-detect
        await page.waitForTimeout(2000);
        const innerScenario = await detectScenario(page);
        if (innerScenario === 'login-required') {
          await fillCredentials(page, account);
        } else if (innerScenario === 'password-only') {
          await fillPassword(page, account);
        } else if (innerScenario === 'stale-session') {
          const clickedExisting = await tryClickExistingAccount(page, account.username);
          if (clickedExisting) {
            await fillPassword(page, account);
          } else {
            await clickUseAnotherAccount(page);
            await fillCredentials(page, account);
          }
        }
      }
    } else if (scenario === 'login-required') {
      await fillCredentials(page, account);
    } else if (scenario === 'password-only') {
      await fillPassword(page, account);
    } else if (scenario === 'stale-session') {
      // Account picker is showing — try clicking the matching account tile first,
      // otherwise click "Use another account" to get to the login form.
      const clickedExisting = await tryClickExistingAccount(page, account.username);
      if (clickedExisting) {
        // Clicked the tile for this account — goes straight to password
        await fillPassword(page, account);
      } else {
        await clickUseAnotherAccount(page);
        await fillCredentials(page, account);
      }
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
 * A — Session alive: destination content is visible (no login elements present)
 * B — Login required: username input is visible
 * C — Stale session: account picker is visible (shows existing accounts + "Use another account")
 *
 * IMPORTANT: We check for login/picker FIRST with short timeouts, then fall through
 * to session-alive. The old Promise.race approach was unreliable because generic
 * selectors like #app could match on the login page itself, causing the race to
 * resolve as "session-alive" when login was actually needed.
 */
async function detectScenario(page) {
  // Give the page a moment to settle after navigation
  await page.waitForTimeout(1500);

  // Check for login form first (highest priority — most specific)
  const loginInput = await page.$('input[name="loginfmt"]');
  if (loginInput) {
    logger.log('[launch] Detected: login-required (username input found)');
    return 'login-required';
  }

  // Check for account picker (second priority)
  const pickerSelectors = [
    '#otherTile',
    '#otherTileText',
    '[data-test-id="otherTile"]',
    '#tilesHolder',
    '[data-test-id="accountList"]',
  ];
  for (const sel of pickerSelectors) {
    const el = await page.$(sel);
    if (el) {
      logger.log(`[launch] Detected: stale-session (matched ${sel})`);
      return 'stale-session';
    }
  }

  // Also check text-based selectors for account picker
  const bodyText = await page.textContent('body').catch(() => '');
  if (bodyText.includes('Use another account') || bodyText.includes('Sign in with a different account')) {
    logger.log('[launch] Detected: stale-session (text match)');
    return 'stale-session';
  }

  // Check for password prompt (mid-session — user is known, just need password)
  const passwordInput = await page.$('input[name="passwd"]');
  if (passwordInput) {
    logger.log('[launch] Detected: login-required (password input found, skipping username)');
    return 'password-only';
  }

  // If none of the login elements are present, wait a bit for the destination to load
  // and check if we're actually on a Microsoft login domain
  const url = page.url();
  if (url.includes('login.microsoftonline.com') || url.includes('login.live.com') || url.includes('login.microsoft.com')) {
    // We're on a login page but didn't match any known elements yet — wait for them
    logger.log('[launch] On login domain, waiting for elements...');
    try {
      const matched = await Promise.race([
        page.waitForSelector('input[name="loginfmt"]', { timeout: 10000 }).then(() => 'login-required'),
        page.waitForSelector('#otherTile, #otherTileText, #tilesHolder', { timeout: 10000 }).then(() => 'stale-session'),
        page.waitForSelector('input[name="passwd"]', { timeout: 10000 }).then(() => 'password-only'),
      ]);
      logger.log(`[launch] Resolved to: ${matched}`);
      return matched;
    } catch {
      logger.log('[launch] Login domain but no elements matched — treating as login-required');
      return 'login-required';
    }
  }

  // Check if the destination page itself has a "Sign in" button
  // (e.g., m365.cloud.microsoft shows a Sign in button instead of redirecting to login)
  const signInBtn = await page.$('a:has-text("Sign in"), button:has-text("Sign in")');
  if (signInBtn) {
    logger.log('[launch] Detected: sign-in-button (destination has Sign in button)');
    return 'sign-in-button';
  }

  // Not on a login page and no login elements found — session is alive
  logger.log('[launch] Detected: session-alive');
  return 'session-alive';
}

/**
 * Try to click an existing account tile on the Microsoft account picker.
 * If the target account's username is visible as a tile, clicking it goes
 * straight to the password prompt (skipping the username step).
 *
 * @returns {boolean} true if we found and clicked the account tile
 */
async function tryClickExistingAccount(page, username) {
  try {
    // Microsoft account picker shows tiles with the email displayed.
    // Look for a tile containing this username text.
    const tiles = await page.$$('[data-test-id="accountList"] .table-row, #tilesHolder .tile-container, .tile');
    for (const tile of tiles) {
      const text = await tile.textContent().catch(() => '');
      if (text.toLowerCase().includes(username.toLowerCase())) {
        logger.log(`[launch] Found existing account tile for ${username}, clicking it`);
        await tile.click();
        // Wait for password prompt
        await page.waitForSelector('input[name="passwd"]', { timeout: STEP_TIMEOUT });
        return true;
      }
    }

    // Fallback: try finding a small element with the exact email text
    const emailEl = await page.$(`text=${username}`);
    if (emailEl) {
      // Make sure this isn't the "Use another account" text
      const parentText = await emailEl.evaluate((el) => el.closest('[role="option"], .tile-container, .tile, div[tabindex]')?.textContent || '');
      if (!parentText.toLowerCase().includes('use another') && !parentText.toLowerCase().includes('sign in with a different')) {
        logger.log(`[launch] Found email text for ${username}, clicking it`);
        await emailEl.click();
        await page.waitForSelector('input[name="passwd"]', { timeout: STEP_TIMEOUT });
        return true;
      }
    }
  } catch (err) {
    logger.log(`[launch] Could not click existing account tile: ${err.message}`);
  }
  return false;
}

/**
 * Fill just the password (when account was selected from picker or password prompt shown directly).
 */
async function fillPassword(page, account) {
  await page.waitForSelector('input[name="passwd"]', { timeout: STEP_TIMEOUT });
  await page.fill('input[name="passwd"]', account.password);
  await page.click('input[type="submit"]');

  // Handle "Stay signed in?" prompt
  try {
    await page.waitForSelector('#idSIButton9, input[value="Yes"], text=Yes', { timeout: 10000 });
    await page.click('#idSIButton9, input[value="Yes"], text=Yes');
  } catch {
    // Prompt may not appear
  }

  try {
    await page.waitForLoadState('domcontentloaded', { timeout: STEP_TIMEOUT });
  } catch {
    // May already be loaded
  }
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
