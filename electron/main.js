const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, session } = require('electron');
const path = require('path');
const store = require('./store');
const launcher = require('./launcher');

const isDev = !app.isPackaged;
let mainWindow = null;
let tray = null;

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
  return store.addAccount(account);
});

ipcMain.handle('accounts:update', (_event, account) => {
  return store.updateAccount(account);
});

ipcMain.handle('accounts:delete', (_event, { id }) => {
  const result = store.deleteAccount(id);
  launcher.deleteProfile(id);
  return result;
});

// Destinations
ipcMain.handle('destinations:list', () => {
  return store.getDestinations();
});

ipcMain.handle('destinations:add', (_event, destination) => {
  return store.addDestination(destination);
});

ipcMain.handle('destinations:update', (_event, destination) => {
  return store.updateDestination(destination);
});

ipcMain.handle('destinations:delete', (_event, { id }) => {
  return store.deleteDestination(id);
});

// Launch
ipcMain.handle('launch:account', async (_event, { id }) => {
  const account = store.getAccountWithPassword(id);
  if (!account) throw new Error(`Account not found: ${id}`);

  const destinations = store.getDestinations();
  const destination = destinations.find((d) => d.id === account.destinationId);
  if (!destination) throw new Error(`Destination not found for account: ${id}`);

  const browserChannel = store.getBrowserChannel();

  // Run launch in background — status updates go via mainWindow.webContents.send
  launcher.launchAccount(account, destination, browserChannel, ({ id: accId, status, error }) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('launch:status', { id: accId, status, error });
    }
  });
});

// Theme
ipcMain.handle('theme:get', () => {
  return store.getTheme();
});

ipcMain.handle('theme:set', (_event, theme) => {
  return store.setTheme(theme);
});

// Browser channel
ipcMain.handle('browser:get', () => {
  return store.getBrowserChannel();
});

ipcMain.handle('browser:set', (_event, channel) => {
  return store.setBrowserChannel(channel);
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
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self'",
          ],
        },
      });
    });
  }

  createWindow();
  createTray();
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
