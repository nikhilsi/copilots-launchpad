# Changelog

All notable changes to CoPilots Launchpad.

---

## [0.8.4] - 2026-03-11

### Windows Code Signing

- **Azure Trusted Signing** — Windows .exe is now signed via Azure Artifact Signing (Public Trust certificate, verified publisher: Urmila Singhal)
- **electron-builder v26** — upgraded from v24.13.3 to v26.0.1 for native `azureSignOptions` support
- **GitHub Actions** — release workflow passes Azure credentials to Windows build step for automated signing
- **SmartScreen** — signed .exe should no longer trigger "unverified publisher" warnings

---

## [0.8.3] - 2026-03-11

### Bug Fixes (GitHub Issues)

- **Account picker fix (issue #3)** — robust multi-selector approach for Microsoft "Use another account" button; handles `#otherTile`, `#otherTileText`, `[data-test-id="otherTile"]`, and text-based selectors
- **Sample CSV template (issue #1)** — added `docs/sample-accounts.csv` with example accounts and all columns

---

## [0.8.2] - 2026-03-11

### Documentation & UX

- **User guide** — comprehensive onboarding doc at `docs/user-guide.md` with step-by-step setup, CSV import walkthrough, troubleshooting
- **Default destination** — Copilot Chat (`https://m365.cloud.microsoft/chat`) seeded on first run so new users have a destination ready
- **README** — added screenshots section, user guide link, sample CSV link
- **Screenshots** — 9 screenshots added to `docs/screenshots/` (launcher, settings, modals, search)

---

## [0.8.1] - 2026-03-11

### Fixes

- **App name in menu bar** — added `productName` to package.json so macOS menu bar shows "CoPilots Launchpad" instead of "Electron" in packaged builds

---

## [0.8.0] - 2026-03-06

### CSV Import/Export

- **CSV import** — file picker, custom CSV parser (handles quoted fields, BOM, case-insensitive headers), import preview screen with defaults bar (destination, group, color), conflict detection by username, selective row import
- **CSV export** — export all accounts to CSV with optional plaintext password inclusion (opt-in toggle with security warning)
- **Import preview** — dedicated screen showing status per row (Ready/Exists/Invalid), disabled rows for conflicts ("Already exists — delete first to reimport"), checkboxes for selective import
- **IPC channels** — `accounts:import` and `accounts:export` with validation

### Security Hardening

- **Electron safeStorage** — passwords encrypted via OS keychain (Keychain on macOS, DPAPI on Windows), replacing hardcoded encryption key
- **IPC input validation** — type checking, required fields, URL scheme whitelist (`http://`/`https://`), hex color format, browser channel whitelist
- **Path traversal protection** — `path.basename()` sanitizes profile path components
- **Accessibility** — ARIA roles, keyboard navigation (Enter/Space/Escape), focus-visible indicators across all interactive components
- **CSP strengthened** — explicit directives for fonts, connect, object, frame-ancestors
- **Password hygiene** — cleared from React state after modal save

### GitHub Actions

- **Automated release builds** — `.github/workflows/release.yml` triggered on `v*` tag push
- **Matrix build** — macOS .dmg + Windows .exe on respective GitHub-hosted runners
- **GitHub Release** — artifacts uploaded automatically

### Other

- **MIT license** added
- **README rewritten** for public-facing repo (features, architecture, security, setup)

---

## [0.7.0] - 2026-03-06

### Bug Fixes & Polish

- **Launcher fix** — use `launchPersistentContext` instead of `--user-data-dir` arg (Playwright API requirement)
- **Error UX** — strip IPC prefix from user-facing errors, clear error banner on tab switch
- **Launch logging** — main process logs launch status for debugging
- **App icon** — indigo rocket icon replacing placeholder (ico, png, tray sizes)
- **macOS testing passed** — Chrome + Edge launch, profile isolation, browser switching, dark mode, search, delete cleanup, tray minimize, data persistence

---

## [0.6.0] - 2026-03-06

### Cross-Platform & Browser Choice

- **Cross-platform** — app now targets both macOS and Windows
- **Configurable browser** — Chrome or Edge, selectable in Settings → General tab
- **Platform-aware defaults** — Chrome on macOS, Edge on Windows (stored as `browserChannel` in electron-store)
- **Namespaced profiles** — `profiles/<channel>/<account-id>/` isolates browser data per channel; cookies encrypted per-browser aren't portable
- **Profile cleanup** — account deletion removes profiles across all browser channels
- **Spec doc v1.1** — updated to capture theme, cross-platform, and browser choice features
- **IPC channels** — added `browser:get` and `browser:set` for browser preference

---

## [0.5.0] - 2026-03-06

### Phase 4: Build & Ship

- **Production build** — `npm run build` produces optimized React bundle (170KB JS, 18KB CSS)
- **Windows installer** — `npm run dist:win` cross-compiles 80MB NSIS .exe from macOS via Wine
- **App icon** — placeholder indigo .ico for installer and taskbar
- **Dist scripts** — `dist:win` and `dist:mac` added to package.json

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
