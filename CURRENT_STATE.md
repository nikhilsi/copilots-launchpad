# Current State

---
**Last Updated**: March 15, 2026
**Purpose**: Project context for new Claude Code sessions
**What's Next**: See NOW.md
---

**Phase**: Phase 4 Complete + Auto-Update + Help | **Status**: v0.9.0 ready for release

---

## What's Done

### Auto-Update, Login Fix, Help & Logging (March 15, 2026)
- **Auto-updater** — `electron-updater` checks GitHub Releases on launch, in-app banner for download/install, tray menu "Check for Updates..."
- **Login flow overhaul** — sequential detection replaces broken `Promise.race`; handles sign-in button, account picker tile click, password-only, URL-based fallback
- **Help page** — dedicated view via ? icon on launcher (quick start, CSV guide, features, troubleshooting)
- **Tooltips** — hover hints on all form fields in modals
- **Send Logs** — Settings > General > Troubleshooting: emails recent logs for debugging
- **Logger** — in-memory ring buffer (200 entries) with timestamps

### Windows Code Signing — Azure Trusted Signing (March 11, 2026)
- **Azure Artifact Signing** — account `copilotslaunchpad` with Public Trust certificate profile `copilots-launchpad`
- **Verified publisher** — identity verified as Urmila Singhal (individual, Public Trust)
- **electron-builder v26** — upgraded from v24.13.3 to v26.0.1 for native `azureSignOptions` support
- **GitHub Actions integration** — release workflow passes `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` to Windows build step
- **Config** — `electron-builder.yml` has `azureSignOptions` under `win:` (endpoint, cert profile, account name, publisher)
- **Funded** — $9.99/mo via Urmila's MSFT FTE Visual Studio Enterprise $150/mo Azure credits

### Bug Fixes & Polish (March 11, 2026)
- **Account picker fix (issue #3)** — robust multi-selector approach in `launcher.js` for Microsoft "Use another account" button
- **Sample CSV template (issue #1)** — `docs/sample-accounts.csv`
- **Default destination** — Copilot Chat seeded on first run in `store.js`
- **User guide** — `docs/user-guide.md` with full onboarding walkthrough
- **Screenshots** — 9 screenshots in `docs/screenshots/` added to README
- **App name fix** — `productName` in package.json for macOS menu bar

### CSV Import/Export (March 6, 2026)
- **CSV import** — file picker, custom CSV parser (handles quoted fields, BOM), import preview screen with defaults bar (destination, group, color), conflict detection by username, selective import via checkboxes
- **CSV export** — export all accounts to CSV with optional plaintext password inclusion (opt-in with warning)
- **Import preview screen** — dedicated view showing each row's status (Ready/Exists/Invalid), disabled rows for conflicts, bulk defaults application
- **Design spec** — `docs/0.8.0-csv-import-export-spec.md`

### Security Hardening (March 6, 2026)
- **Electron safeStorage** — passwords encrypted via OS keychain (Keychain on macOS, DPAPI on Windows), replacing hardcoded encryption key
- **IPC input validation** — type checking, required field validation, URL scheme whitelist (`http://`/`https://`), hex color format, browser channel whitelist in main process
- **Path traversal protection** — `path.basename()` sanitizes account IDs and channel names in profile paths
- **Accessibility** — `role`, `tabIndex`, `aria-label`, `aria-expanded`, `aria-modal`, keyboard handlers (Enter/Space/Escape), `focus-visible` ring styles across all interactive components
- **CSP strengthened** — explicit directives for fonts, connect, object, frame-ancestors
- **Password hygiene** — passwords cleared from React state after modal save

### GitHub Actions Release (March 6, 2026)
- **Automated builds** — `.github/workflows/release.yml` triggered on `v*` tag push
- **Matrix build** — macOS .dmg + Windows .exe on respective runners
- **GitHub Release** — artifacts uploaded automatically via `softprops/action-gh-release`

### Cross-Platform & Browser Choice (March 6, 2026)
- **Cross-platform support** — app runs on both macOS and Windows
- **Configurable browser** — Chrome or Edge, selectable in Settings → General tab
- **Platform-aware defaults** — Chrome on macOS, Edge on Windows
- **Namespaced profiles** — `profiles/<channel>/<account-id>/` prevents cross-contamination between browsers
- **Account deletion** — cleans up profiles across all browser channels
- **Spec updated** — v1.1 captures theme, cross-platform, and browser choice features

### Phase 4: Build & Ship (March 6, 2026)
- **Production build** — `npm run build` produces optimized React bundle (170KB JS, 18KB CSS)
- **Windows installer** — `npm run dist:win` cross-compiles 80MB NSIS .exe from macOS
- **macOS installer** — `npm run dist:mac` for .dmg
- **App icon** — placeholder indigo .ico for installer and taskbar
- **Dist scripts** — `dist:win` and `dist:mac` for platform-specific builds

### Phase 3: Playwright Integration (March 6, 2026)
- Login flow with 3-scenario detection, credential fill, 30s timeouts, detach after login
- Profile management (auto-create/delete), real-time status updates via IPC

### Phase 2: React UI (March 6, 2026)
- Full component structure, IPC hooks, Launcher + Settings pages, modals, dark/light/system theme

### Phase 1: Scaffold & Electron Shell (March 6, 2026)
- Vite + React + Tailwind, Electron main process, system tray, credential store

### Design & Planning (March 6, 2026)
- Full design spec, working UI prototype, product overview PDF

---

## macOS Testing — PASSED

- [x] Chrome launch + profile isolation
- [x] Edge launch + profile isolation
- [x] Browser switching (Chrome <-> Edge) in Settings → General
- [x] Multiple simultaneous accounts (separate browser windows)
- [x] Status dot (yellow on launch)
- [x] Search/filter on Launcher
- [x] Dark/light/system theme
- [x] Delete account (profile cleanup across both browsers)
- [x] Close-to-tray behavior
- [x] Data persistence after app restart
- [x] CSV export (with and without passwords)
- [x] CSV import (preview, defaults, conflict detection)

## Windows Testing — IN PROGRESS

- [x] Verify code signing (no "unverified publisher" warning) — **confirmed v0.8.4**
- [x] GitHub issue #2 closed
- [ ] Tag v0.9.0 — auto-updater, login fix, help tab, send logs
- [ ] Urmila tests login flow with account picker (issue #3 retest)
- [ ] Test Edge integration (`channel: 'msedge'`)
- [ ] Test with real M365 test accounts
- [ ] Validate tray icon, Start Menu entry

---

## Key Config

- **Supported platforms:** Windows 11, macOS
- **Supported browsers:** Google Chrome, Microsoft Edge (configurable in Settings)
- **Dev platform:** macOS
- **Storage:** `<app-data>/copilots-launchpad/config.json` (encrypted via safeStorage)
- **Profiles:** `<app-data>/copilots-launchpad/profiles/<channel>/<account-id>/`
