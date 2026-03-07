const Store = require('electron-store');
const crypto = require('crypto');

const store = new Store({
  name: 'config',
  encryptionKey: 'copilots-launchpad-v1',
  defaults: {
    accounts: [],
    destinations: [],
    theme: 'system',
    browserChannel: process.platform === 'win32' ? 'msedge' : 'chrome',
  },
});

// --- Accounts ---

function getAccounts() {
  const accounts = store.get('accounts', []);
  // Strip passwords from list responses — renderer should never see plaintext
  return accounts.map(({ password, ...rest }) => ({ ...rest, hasPassword: !!password }));
}

function getAccountWithPassword(id) {
  const accounts = store.get('accounts', []);
  return accounts.find((a) => a.id === id) || null;
}

function addAccount(account) {
  const accounts = store.get('accounts', []);
  const newAccount = {
    ...account,
    id: account.id || `acc-${crypto.randomUUID()}`,
  };
  accounts.push(newAccount);
  store.set('accounts', accounts);
  return { ...newAccount, password: undefined, hasPassword: !!newAccount.password };
}

function updateAccount(account) {
  const accounts = store.get('accounts', []);
  const idx = accounts.findIndex((a) => a.id === account.id);
  if (idx === -1) throw new Error(`Account not found: ${account.id}`);

  // If password is not provided in the update, keep the existing one
  if (account.password === undefined || account.password === '') {
    account.password = accounts[idx].password;
  }

  accounts[idx] = { ...accounts[idx], ...account };
  store.set('accounts', accounts);
  return { ...accounts[idx], password: undefined, hasPassword: !!accounts[idx].password };
}

function deleteAccount(id) {
  const accounts = store.get('accounts', []);
  store.set('accounts', accounts.filter((a) => a.id !== id));
  return { success: true };
}

// --- Destinations ---

function getDestinations() {
  return store.get('destinations', []);
}

function addDestination(destination) {
  const destinations = store.get('destinations', []);
  const newDest = {
    ...destination,
    id: destination.id || `dest-${crypto.randomUUID()}`,
  };
  destinations.push(newDest);
  store.set('destinations', destinations);
  return newDest;
}

function updateDestination(destination) {
  const destinations = store.get('destinations', []);
  const idx = destinations.findIndex((d) => d.id === destination.id);
  if (idx === -1) throw new Error(`Destination not found: ${destination.id}`);
  destinations[idx] = { ...destinations[idx], ...destination };
  store.set('destinations', destinations);
  return destinations[idx];
}

function deleteDestination(id) {
  const accounts = store.get('accounts', []);
  const inUse = accounts.some((a) => a.destinationId === id);
  if (inUse) {
    throw new Error('Cannot delete — this destination is assigned to one or more accounts.');
  }
  const destinations = store.get('destinations', []);
  store.set('destinations', destinations.filter((d) => d.id !== id));
  return { success: true };
}

// --- Theme ---

function getTheme() {
  return store.get('theme', 'system');
}

function setTheme(theme) {
  store.set('theme', theme);
  return theme;
}

// --- Browser Channel ---

function getBrowserChannel() {
  const defaultChannel = process.platform === 'win32' ? 'msedge' : 'chrome';
  return store.get('browserChannel', defaultChannel);
}

function setBrowserChannel(channel) {
  store.set('browserChannel', channel);
  return channel;
}

module.exports = {
  getAccounts,
  getAccountWithPassword,
  addAccount,
  updateAccount,
  deleteAccount,
  getDestinations,
  addDestination,
  updateDestination,
  deleteDestination,
  getTheme,
  setTheme,
  getBrowserChannel,
  setBrowserChannel,
};
