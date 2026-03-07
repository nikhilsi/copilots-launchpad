const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Accounts
  getAccounts: () => ipcRenderer.invoke('accounts:list'),
  addAccount: (account) => ipcRenderer.invoke('accounts:add', account),
  updateAccount: (account) => ipcRenderer.invoke('accounts:update', account),
  deleteAccount: (id) => ipcRenderer.invoke('accounts:delete', { id }),

  // Destinations
  getDestinations: () => ipcRenderer.invoke('destinations:list'),
  addDestination: (dest) => ipcRenderer.invoke('destinations:add', dest),
  updateDestination: (dest) => ipcRenderer.invoke('destinations:update', dest),
  deleteDestination: (id) => ipcRenderer.invoke('destinations:delete', { id }),

  // Theme
  getTheme: () => ipcRenderer.invoke('theme:get'),
  setTheme: (theme) => ipcRenderer.invoke('theme:set', theme),

  // Browser channel
  getBrowserChannel: () => ipcRenderer.invoke('browser:get'),
  setBrowserChannel: (channel) => ipcRenderer.invoke('browser:set', channel),

  // Launch
  launchAccount: (id) => ipcRenderer.invoke('launch:account', { id }),

  // Listen for launch status updates from main process
  onLaunchStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('launch:status', handler);
    return () => ipcRenderer.removeListener('launch:status', handler);
  },
});
