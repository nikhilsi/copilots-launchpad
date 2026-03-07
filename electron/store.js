const Store = require('electron-store');
const crypto = require('crypto');
const { safeStorage } = require('electron');

const store = new Store({
  name: 'config',
  defaults: {
    accounts: [],
    destinations: [],
    theme: 'system',
    browserChannel: process.platform === 'win32' ? 'msedge' : 'chrome',
  },
});

/**
 * Encrypt a password using Electron's safeStorage (OS keychain-backed).
 * Falls back to plaintext only if safeStorage is unavailable (rare).
 */
function encryptPassword(password) {
  if (!password) return '';
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(password).toString('base64');
  }
  return password;
}

function decryptPassword(encrypted) {
  if (!encrypted) return '';
  if (safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
    } catch {
      // Might be a legacy plaintext password — return as-is
      return encrypted;
    }
  }
  return encrypted;
}

// --- Accounts ---

function getAccounts() {
  const accounts = store.get('accounts', []);
  // Strip passwords from list responses — renderer should never see plaintext
  return accounts.map(({ password, ...rest }) => ({ ...rest, hasPassword: !!password }));
}

function getAccountWithPassword(id) {
  const accounts = store.get('accounts', []);
  const account = accounts.find((a) => a.id === id);
  if (!account) return null;
  return { ...account, password: decryptPassword(account.password) };
}

function addAccount(account) {
  const accounts = store.get('accounts', []);
  const newAccount = {
    ...account,
    id: account.id || `acc-${crypto.randomUUID()}`,
    password: encryptPassword(account.password),
  };
  accounts.push(newAccount);
  store.set('accounts', accounts);
  return { ...newAccount, password: undefined, hasPassword: !!newAccount.password };
}

function updateAccount(account) {
  const accounts = store.get('accounts', []);
  const idx = accounts.findIndex((a) => a.id === account.id);
  if (idx === -1) throw new Error(`Account not found: ${account.id}`);

  // If password is not provided in the update, keep the existing encrypted one
  if (account.password === undefined || account.password === '') {
    account.password = accounts[idx].password;
  } else {
    account.password = encryptPassword(account.password);
  }

  accounts[idx] = { ...accounts[idx], ...account };
  store.set('accounts', accounts);
  return { ...accounts[idx], password: undefined, hasPassword: !!accounts[idx].password };
}

function importAccounts(accountsToImport) {
  const accounts = store.get('accounts', []);
  let imported = 0;
  for (const acc of accountsToImport) {
    const newAccount = {
      ...acc,
      id: `acc-${crypto.randomUUID()}`,
      password: encryptPassword(acc.password),
    };
    accounts.push(newAccount);
    imported++;
  }
  store.set('accounts', accounts);
  return { imported };
}

function getAccountsForExport(includePasswords) {
  const accounts = store.get('accounts', []);
  const destinations = store.get('destinations', []);
  return accounts.map((a) => {
    const dest = destinations.find((d) => d.id === a.destinationId);
    return {
      label: a.label,
      username: a.username,
      password: includePasswords ? decryptPassword(a.password) : '',
      destination: dest ? dest.label : '',
      group: a.group,
      color: a.color,
      notes: a.notes || '',
    };
  });
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
  importAccounts,
  getAccountsForExport,
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
