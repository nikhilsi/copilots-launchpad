const { autoUpdater } = require('electron-updater');
const { ipcMain } = require('electron');

let mainWindow = null;

/**
 * Initialize the auto-updater.
 * Checks GitHub Releases for a newer version, downloads in the background,
 * and notifies the renderer when an update is ready to install.
 *
 * @param {BrowserWindow} win - The main window (for sending IPC events)
 */
function initUpdater(win) {
  mainWindow = win;

  // Don't auto-download — let us control the flow
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // --- Events → renderer ---

  autoUpdater.on('update-available', (info) => {
    console.log(`[updater] Update available: v${info.version}`);
    send('update:available', { version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    console.log('[updater] No update available');
    send('update:not-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    send('update:progress', { percent: Math.round(progress.percent) });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[updater] Update downloaded: v${info.version}`);
    send('update:downloaded', { version: info.version });
  });

  autoUpdater.on('error', (err) => {
    console.error('[updater] Error:', err.message);
    send('update:error', { message: err.message });
  });

  // --- IPC handlers (renderer → main) ---

  ipcMain.handle('update:check', () => {
    autoUpdater.checkForUpdates();
  });

  ipcMain.handle('update:download', () => {
    autoUpdater.downloadUpdate();
  });

  ipcMain.handle('update:install', () => {
    autoUpdater.quitAndInstall();
  });

  // Check for updates 5 seconds after launch (non-blocking)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.log('[updater] Auto-check failed (offline?):', err.message);
    });
  }, 5000);
}

function send(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

module.exports = { initUpdater };
