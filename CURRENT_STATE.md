# Current State

---
**Last Updated**: March 6, 2026
**Purpose**: Project context for new Claude Code sessions
**What's Next**: See NOW.md
---

**Phase**: Phase 4 Complete | **Status**: macOS tested, Windows testing next

---

## What's Done

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
- [x] Browser switching (Chrome ↔ Edge) in Settings → General
- [x] Multiple simultaneous accounts (separate browser windows)
- [x] Status dot (yellow on launch)
- [x] Search/filter on Launcher
- [x] Dark/light/system theme
- [x] Delete account (profile cleanup across both browsers)
- [x] Close-to-tray behavior
- [x] Data persistence after app restart

## Windows Testing — NEXT

- [ ] Install .exe on Windows 11 (per-user, no admin)
- [ ] Test Edge integration (`channel: 'msedge'`)
- [ ] Test with real M365 test accounts
- [ ] Validate tray icon, Start Menu entry

---

## Key Config

- **Supported platforms:** Windows 11, macOS
- **Supported browsers:** Google Chrome, Microsoft Edge (configurable in Settings)
- **Dev platform:** macOS
- **Storage:** `<app-data>/copilots-launchpad/config.json` (encrypted)
- **Profiles:** `<app-data>/copilots-launchpad/profiles/<channel>/<account-id>/`
