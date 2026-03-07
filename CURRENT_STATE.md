# Current State

---
**Last Updated**: March 6, 2026
**Purpose**: Project context for new Claude Code sessions
**What's Next**: See NOW.md
---

**Phase**: Phase 3 Complete | **Status**: Playwright login flow wired, ready for build & Windows testing

---

## What's Done

### Phase 3: Playwright Integration (March 6, 2026)
- **Login flow** (`electron/launcher.js`) — Playwright launches browser with `--user-data-dir` per account, detects login scenario via `Promise.race`, fills credentials, detaches after login
- **Scenario detection** — Session alive (skip login), Login required (fill credentials), Stale session (click "Use another account" then fill)
- **Credential flow** — username → Next → password → Sign In → Stay signed in? → Yes, 30s timeout per step
- **Browser channel** — `channel: 'chrome'` on macOS (dev), `channel: 'msedge'` on Windows (prod)
- **Profile management** — Auto-create profile dir on first launch, delete on account removal
- **Status updates** — `launch:status` IPC events flow from launcher → main → renderer in real-time
- **Launch IPC handler** — Fetches account with password from store, resolves destination, runs launch with status callbacks

### Phase 2: React UI (March 6, 2026)
- Full component structure, IPC hooks, Launcher + Settings pages, modals, dark/light/system theme

### Phase 1: Scaffold & Electron Shell (March 6, 2026)
- Vite + React + Tailwind, Electron main process, system tray, credential store, all IPC handlers

### Design & Planning (March 6, 2026)
- Full design spec, working UI prototype, product overview PDF

---

## Not Yet Built

- **Build/packaging** — `npm run build` + `npm run dist` → Windows .exe installer
- **Windows testing** — Edge integration, installer validation, real M365 accounts

---

## Key Design References

| Document | Purpose |
|----------|---------|
| `docs/CoPilots_Launchpad_Spec.md` | Source of truth — full spec |
| `docs/CopilotLauncher.jsx` | Visual reference — working prototype |
| `docs/CoPilots_Launchpad_Product_Overview.pdf` | Product overview deck |

---

## Key Config

- **Target platform:** Windows 11 with Edge pre-installed
- **Dev platform:** macOS (Electron + React are cross-platform; Playwright uses `channel: 'chrome'` locally, `channel: 'msedge'` on Windows)
- **Storage:** `%APPDATA%/copilots-launchpad/config.json` (encrypted)
- **Profiles:** `%APPDATA%/copilots-launchpad/profiles/<account-id>/`
- **Install location:** `%LOCALAPPDATA%` (per-user, no admin)
