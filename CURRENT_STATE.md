# Current State

---
**Last Updated**: March 6, 2026
**Purpose**: Project context for new Claude Code sessions
**What's Next**: See NOW.md
---

**Phase**: Phase 4 In Progress | **Status**: Windows .exe built, needs testing on Windows 11

---

## What's Done

### Phase 4: Build & Ship (March 6, 2026)
- **Production build** — `npm run build` produces optimized React bundle (170KB JS, 18KB CSS)
- **Windows installer** — `npm run dist:win` cross-compiles 80MB NSIS .exe from macOS
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

## Still Needs Windows Testing

- Install .exe on Windows 11 (per-user, no admin)
- Test Edge integration (`channel: 'msedge'`)
- Test with real M365 test accounts
- Test simultaneous sessions (2-3 accounts side by side)
- Validate tray icon, Start Menu entry

---

## Key Config

- **Target platform:** Windows 11 with Edge pre-installed
- **Dev platform:** macOS
- **Installer:** `dist/CoPilots Launchpad Setup 0.1.0.exe` (80MB)
- **Storage:** `%APPDATA%/copilots-launchpad/config.json` (encrypted)
- **Profiles:** `%APPDATA%/copilots-launchpad/profiles/<account-id>/`
