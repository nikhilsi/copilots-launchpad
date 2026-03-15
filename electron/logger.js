/**
 * Simple in-memory ring buffer logger.
 * Captures log entries from the main process so they can be
 * sent via email for debugging.
 */

const MAX_ENTRIES = 200;
const entries = [];

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  entries.push(line);
  if (entries.length > MAX_ENTRIES) entries.shift();
  console.log(message);
}

function getEntries() {
  return entries.slice();
}

function clear() {
  entries.length = 0;
}

module.exports = { log, getEntries, clear };
