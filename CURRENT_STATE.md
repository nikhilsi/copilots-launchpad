# Current State

---
**Last Updated**: March 6, 2026
**Purpose**: Project context for new Claude Code sessions
**What's Next**: See NOW.md
---

**Phase**: Phase 1 Complete | **Status**: Electron shell, tray, IPC, and credential store working

---

## What's Done

### Phase 1: Scaffold & Electron Shell (March 6, 2026)
- **Project scaffold** — Vite + React + Tailwind CSS, `npm run dev` launches Electron with hot-reloading React renderer
- **Electron main process** (`electron/main.js`) — BrowserWindow with dark background, dev vs prod URL loading, system tray with click-to-open and right-click menu (Open Launcher, Quit), close-to-tray behavior
- **Preload / context bridge** (`electron/preload.js`) — all IPC channels exposed via `window.api`, includes launch status listener with cleanup
- **Credential store** (`electron/store.js`) — electron-store with AES-256 encryption, full CRUD for accounts and destinations, passwords stripped from list responses (never reach renderer), destination delete guard (can't delete if assigned to accounts)
- **IPC handlers** — all 10 channels wired: `accounts:list/add/update/delete`, `destinations:list/add/update/delete`, `launch:account`, `launch:status`
- **Build config** — `electron-builder.yml` configured for NSIS per-user Windows installer
- **Placeholder tray icon** — 16x16 indigo square in `assets/tray-icon.png`

### Design & Planning (March 6, 2026)
- **Full design spec** — `docs/CoPilots_Launchpad_Spec.md` covers data model, Edge profile management, Playwright login flow (3-scenario detection via Promise.race), application architecture, UI design, system tray behavior, build/packaging, security considerations, and V2 roadmap
- **Working UI prototype** — `docs/CopilotLauncher.jsx` is a React component demonstrating both screens (Launcher + Settings), both modals (Account + Destination), search/filter, collapsible groups, launch animation, and the full visual design (dark theme, DM Sans + JetBrains Mono, indigo accent)
- **Product overview** — `docs/CoPilots_Launchpad_Product_Overview.pdf` — polished deck with screenshots

---

## Not Yet Built

- **React UI** — port prototype to proper component structure, wire to IPC hooks
- **Playwright login flow** — scenario detection, credential fill, detach
- **Build/packaging** — test Windows installer
- **Windows testing** — Edge integration, installer validation

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
