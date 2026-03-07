# Current State

---
**Last Updated**: March 6, 2026
**Purpose**: Project context for new Claude Code sessions
**What's Next**: See NOW.md
---

**Phase**: Pre-Implementation | **Status**: Design spec + UI prototype complete, ready for build

---

## What's Done

### Design & Planning (March 6, 2026)
- **Full design spec** — `docs/CoPilots_Launchpad_Spec.md` covers data model, Edge profile management, Playwright login flow (3-scenario detection via Promise.race), application architecture, UI design, system tray behavior, build/packaging, security considerations, and V2 roadmap
- **Working UI prototype** — `docs/CopilotLauncher.jsx` is a React component demonstrating both screens (Launcher + Settings), both modals (Account + Destination), search/filter, collapsible groups, launch animation, and the full visual design (dark theme, DM Sans + JetBrains Mono, indigo accent)
- **Product overview** — `docs/CoPilots_Launchpad_Product_Overview.pdf` — polished deck with screenshots
- **Architecture decisions locked** — Electron + React + playwright-core, electron-store for encrypted credentials, sandboxed Edge profiles via `--user-data-dir`, detach after login, no admin rights required
- **Admin rights analysis** — confirmed no admin needed for install, runtime, profile creation, WebDriver download, or Edge launch

---

## Not Yet Built

- **Electron main process** — window management, system tray, IPC handlers
- **Preload/context bridge** — secure IPC exposure to renderer
- **electron-store integration** — encrypted CRUD for accounts and destinations
- **Playwright login flow** — scenario detection, credential fill, detach
- **React app** — port from prototype JSX to proper component structure
- **Build/packaging** — electron-builder config, NSIS installer
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
