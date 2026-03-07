# Changelog

All notable changes to CoPilots Launchpad.

---

## [0.3.0] - 2026-03-06

### Phase 2: React UI

- **Component structure** — AccountCard, GroupSection, SearchBar, StatusIndicator, AccountModal, DestModal, ThemeToggle, Icons — all ported from prototype into proper files
- **IPC hooks** — `useAccounts.js` and `useDestinations.js` connect React to electron-store via IPC
- **Launcher page** — account cards in responsive grid, grouped with collapsible colored headers, search/filter, empty states, launch trigger with status dots
- **Settings page** — Accounts and Destinations tabs, table layout with inline edit/delete, Add buttons, modals for full CRUD
- **Dark/light/system theme** — three-way toggle persisted in electron-store, respects OS preference via `prefers-color-scheme`, Tailwind `darkMode: 'class'` strategy
- **Visual polish** — DM Sans + JetBrains Mono fonts, indigo accent (#6366F1), card hover lift, launch pulse animation, proper light and dark colors on all surfaces, modals, inputs, and tables

---

## [0.2.0] - 2026-03-06

### Phase 1: Scaffold & Electron Shell

- **Project scaffold** — Vite + React + Tailwind CSS, `npm run dev` launches Electron with hot-reloading React renderer
- **Electron main process** — BrowserWindow (dark bg, 960x700), dev/prod URL loading, system tray (click to open, right-click Open/Quit), close minimizes to tray
- **Preload context bridge** — `window.api` exposes all IPC channels with proper cleanup for event listeners
- **Credential store** — electron-store with AES-256 encryption, full CRUD for accounts and destinations, passwords stripped from list responses, destination delete guard
- **IPC handlers** — 10 channels: accounts CRUD, destinations CRUD, launch:account, launch:status
- **Build config** — electron-builder.yml for NSIS per-user Windows installer
- **Placeholder tray icon** — 16x16 indigo square

---

## [0.1.0] - 2026-03-06

### Design & Planning Complete

- **Full design spec** — `docs/CoPilots_Launchpad_Spec.md`: data model (accounts, destinations), Edge profile management (sandboxed `--user-data-dir`), Playwright login flow (3-scenario Promise.race detection), application architecture (Electron + React + playwright-core), UI design (dark theme, DM Sans + JetBrains Mono), system tray behavior, build/packaging (electron-builder NSIS), security considerations, V2 roadmap
- **Working UI prototype** — `docs/CopilotLauncher.jsx`: both screens (Launcher, Settings), both modals (Account, Destination), search/filter, collapsible groups with colored headers, launch animation, status indicators, full visual design implemented
- **Product overview** — `docs/CoPilots_Launchpad_Product_Overview.pdf`: polished deck with screenshots
- **Architecture decisions** — Electron main/renderer split, electron-store with AES-256 for credentials, IPC bridge for secure communication, playwright-core with `channel: 'msedge'`, detach-after-login pattern, per-user install (no admin rights)
- **Admin rights analysis** — confirmed zero admin requirements across install, runtime, and all file operations
- **Project docs** — CLAUDE.md, README.md, CURRENT_STATE.md, NOW.md, CHANGELOG.md, .gitignore
