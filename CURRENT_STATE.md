# Current State

---
**Last Updated**: March 6, 2026
**Purpose**: Project context for new Claude Code sessions
**What's Next**: See NOW.md
---

**Phase**: Phase 2 Complete | **Status**: Full React UI with dark/light/system theme, wired to IPC

---

## What's Done

### Phase 2: React UI (March 6, 2026)
- **Component structure** — Ported prototype into proper components: AccountCard, GroupSection, SearchBar, StatusIndicator, AccountModal, DestModal, ThemeToggle, Icons
- **IPC hooks** — `useAccounts.js` and `useDestinations.js` wire React state to electron-store via IPC
- **Launcher page** — Account cards grouped by group, collapsible sections, search/filter across label/username/group/destination, empty states, launch button with status dot
- **Settings page** — Two tabs (Accounts, Destinations), table layout with edit/delete, Add Account/Destination buttons, modals for CRUD
- **Dark/light/system theme** — Three-way toggle (sun/moon/monitor), persisted in electron-store, respects system preference, Tailwind `dark:` class strategy
- **Visual design** — DM Sans + JetBrains Mono fonts, indigo accent, card hover lift, launch pulse animation, proper light and dark mode colors throughout

### Phase 1: Scaffold & Electron Shell (March 6, 2026)
- **Project scaffold** — Vite + React + Tailwind CSS, `npm run dev` launches Electron with hot-reloading React renderer
- **Electron main process** — BrowserWindow, system tray, close-to-tray, CSP for production
- **Preload / context bridge** — All IPC channels exposed via `window.api`
- **Credential store** — electron-store with AES-256 encryption, full CRUD, passwords never in renderer
- **IPC handlers** — accounts CRUD, destinations CRUD, theme get/set, launch:account, launch:status

### Design & Planning (March 6, 2026)
- Full design spec, working UI prototype, product overview PDF

---

## Not Yet Built

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
