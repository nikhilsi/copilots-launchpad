const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, session } = require('electron');
const path = require('path');
const store = require('./store');
const launcher = require('./launcher');
const { initUpdater } = require('./updater');
const logger = require('./logger');

const isDev = !app.isPackaged;
let mainWindow = null;
let tray = null;

// --- Input Validation ---

const ALLOWED_BROWSER_CHANNELS = ['chrome', 'msedge'];
const ALLOWED_THEMES = ['light', 'dark', 'system'];
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const SAFE_URL_RE = /^https?:\/\//i;

function validateAccount(account) {
  if (!account || typeof account !== 'object') throw new Error('Invalid account data');
  if (typeof account.label !== 'string' || !account.label.trim()) throw new Error('Label is required');
  if (typeof account.username !== 'string' || !account.username.trim()) throw new Error('Username is required');
  if (typeof account.group !== 'string' || !account.group.trim()) throw new Error('Group is required');
  if (typeof account.destinationId !== 'string' || !account.destinationId.trim()) throw new Error('Destination is required');
  if (account.color && !HEX_COLOR_RE.test(account.color)) throw new Error('Invalid color format');
}

function validateDestination(dest) {
  if (!dest || typeof dest !== 'object') throw new Error('Invalid destination data');
  if (typeof dest.label !== 'string' || !dest.label.trim()) throw new Error('Label is required');
  if (typeof dest.url !== 'string' || !SAFE_URL_RE.test(dest.url)) throw new Error('URL must start with http:// or https://');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 700,
    minWidth: 600,
    minHeight: 400,
    backgroundColor: '#0C0F1A',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Close → minimize to tray instead of quitting
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Use a simple 16x16 tray icon — placeholder until real asset is added
  const iconPath = path.join(__dirname, '..', 'assets', 'tray-icon.png');
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
  } catch {
    // Fallback: create a tiny empty icon if asset doesn't exist yet
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon.isEmpty() ? nativeImage.createFromBuffer(Buffer.alloc(1)) : trayIcon);
  tray.setToolTip('CoPilots Launchpad');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Launcher',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Check for Updates...',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.webContents.send('update:checking');
        }
        const { autoUpdater } = require('electron-updater');
        autoUpdater.checkForUpdates().catch(() => {});
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// --- IPC Handlers ---

// Accounts
ipcMain.handle('accounts:list', () => {
  return store.getAccounts();
});

ipcMain.handle('accounts:add', (_event, account) => {
  validateAccount(account);
  if (typeof account.password !== 'string' || !account.password) throw new Error('Password is required');
  return store.addAccount(account);
});

ipcMain.handle('accounts:update', (_event, account) => {
  if (!account?.id) throw new Error('Account ID is required');
  validateAccount(account);
  return store.updateAccount(account);
});

ipcMain.handle('accounts:import', (_event, { accounts }) => {
  if (!Array.isArray(accounts) || accounts.length === 0) throw new Error('No accounts to import');
  for (const acc of accounts) {
    validateAccount(acc);
    if (typeof acc.password !== 'string' || !acc.password) throw new Error(`Password is required for ${acc.label}`);
  }
  return store.importAccounts(accounts);
});

ipcMain.handle('accounts:export', (_event, { includePasswords }) => {
  return store.getAccountsForExport(!!includePasswords);
});

ipcMain.handle('accounts:delete', (_event, { id }) => {
  if (!id || typeof id !== 'string') throw new Error('Invalid account ID');
  const result = store.deleteAccount(id);
  launcher.deleteProfile(id);
  return result;
});

// Destinations
ipcMain.handle('destinations:list', () => {
  return store.getDestinations();
});

ipcMain.handle('destinations:add', (_event, destination) => {
  validateDestination(destination);
  return store.addDestination(destination);
});

ipcMain.handle('destinations:update', (_event, destination) => {
  if (!destination?.id) throw new Error('Destination ID is required');
  validateDestination(destination);
  return store.updateDestination(destination);
});

ipcMain.handle('destinations:delete', (_event, { id }) => {
  if (!id || typeof id !== 'string') throw new Error('Invalid destination ID');
  return store.deleteDestination(id);
});

// Launch
ipcMain.handle('launch:account', async (_event, { id }) => {
  if (!id || typeof id !== 'string') throw new Error('Invalid account ID');
  const account = store.getAccountWithPassword(id);
  if (!account) throw new Error(`Account not found: ${id}`);

  const destinations = store.getDestinations();
  const destination = destinations.find((d) => d.id === account.destinationId);
  if (!destination) throw new Error(`Destination not found for account: ${id}`);

  const browserChannel = store.getBrowserChannel();

  const sendStatus = ({ id: accId, status, error }) => {
    logger.log(`[launch] ${accId}: ${status}${error ? ` — ${error}` : ''}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('launch:status', { id: accId, status, error });
    }
  };

  // Run launch in background — status updates go via mainWindow.webContents.send
  launcher.launchAccount(account, destination, browserChannel, sendStatus).catch((err) => {
    logger.log(`[launch] Unhandled error for ${id}: ${err.message}`);
    sendStatus({ id, status: 'error', error: err.message });
  });
});

// Theme
ipcMain.handle('theme:get', () => {
  return store.getTheme();
});

ipcMain.handle('theme:set', (_event, theme) => {
  if (!ALLOWED_THEMES.includes(theme)) throw new Error('Invalid theme');
  return store.setTheme(theme);
});

// Browser channel
ipcMain.handle('browser:get', () => {
  return store.getBrowserChannel();
});

ipcMain.handle('browser:set', (_event, channel) => {
  if (!ALLOWED_BROWSER_CHANNELS.includes(channel)) throw new Error('Invalid browser channel');
  return store.setBrowserChannel(channel);
});

// Logs
ipcMain.handle('logs:get', () => {
  return logger.getEntries();
});

// --- App Lifecycle ---

app.whenReady().then(() => {
  // Set CSP for production (dev needs relaxed policy for Vite HMR)
  if (!isDev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; frame-ancestors 'none'",
          ],
        },
      });
    });
  }

  createWindow();
  createTray();

  // Auto-updater (checks GitHub Releases for newer versions)
  if (!isDev) {
    initUpdater(mainWindow);
  }
});

app.on('window-all-closed', () => {
  // On macOS, keep app running (tray). On Windows, same behavior.
  // The app only quits via tray → Quit.
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
