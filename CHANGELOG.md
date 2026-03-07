# Changelog

All notable changes to CoPilots Launchpad.

---

## [0.4.0] - 2026-03-06

### Phase 3: Playwright Integration

- **Login flow** — `electron/launcher.js`: Playwright launches browser with `--user-data-dir` per account for isolated sessions, detects login scenario via `Promise.race`, fills Microsoft credentials (username → Next → password → Sign In → Stay signed in? → Yes), 30s timeout per step, detaches after login
- **Scenario detection** — Session alive (skip login), Login required (fill credentials), Stale session (click "Use another account" then fill)
- **Browser channel** — `channel: 'chrome'` on macOS dev, `channel: 'msedge'` on Windows prod
- **Profile management** — Auto-create profile dir on first launch, delete profile dir when account is removed
- **Status updates** — Real-time `launch:status` IPC events from launcher → main → renderer
- **Launch IPC handler** — Fetches account with password from store, resolves destination, runs launch asynchronously

---

## [0.3.0] - 2026-03-06

### Phase 2: React UI

- **Component structure** — AccountCard, GroupSection, SearchBar, StatusIndicator, AccountModal, DestModal, ThemeToggle, Icons
- **IPC hooks** — `useAccounts.js` and `useDestinations.js` connect React to electron-store via IPC
- **Launcher page** — account cards in responsive grid, grouped with collapsible colored headers, search/filter, empty states
- **Settings page** — Accounts and Destinations tabs, table layout with inline edit/delete, modals for full CRUD
- **Dark/light/system theme** — three-way toggle persisted in electron-store, respects OS preference
- **Visual polish** — DM Sans + JetBrains Mono, indigo accent, card hover lift, launch pulse animation

---

## [0.2.0] - 2026-03-06

### Phase 1: Scaffold & Electron Shell

- **Project scaffold** — Vite + React + Tailwind CSS, Electron with hot-reloading renderer
- **Electron main process** — BrowserWindow, system tray, close-to-tray, CSP for production
- **Preload context bridge** — `window.api` exposes all IPC channels
- **Credential store** — electron-store with AES-256 encryption, full CRUD, passwords masked
- **Build config** — electron-builder.yml for NSIS per-user Windows installer

---

## [0.1.0] - 2026-03-06

### Design & Planning Complete

- Full design spec, working UI prototype, product overview PDF, architecture decisions, admin rights analysis
