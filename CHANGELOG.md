# Changelog

All notable changes to CoPilots Launchpad.

---

## [0.1.0] - 2026-03-06

### Design & Planning Complete

- **Full design spec** — `docs/CoPilots_Launchpad_Spec.md`: data model (accounts, destinations), Edge profile management (sandboxed `--user-data-dir`), Playwright login flow (3-scenario Promise.race detection), application architecture (Electron + React + playwright-core), UI design (dark theme, DM Sans + JetBrains Mono), system tray behavior, build/packaging (electron-builder NSIS), security considerations, V2 roadmap
- **Working UI prototype** — `docs/CopilotLauncher.jsx`: both screens (Launcher, Settings), both modals (Account, Destination), search/filter, collapsible groups with colored headers, launch animation, status indicators, full visual design implemented
- **Product overview** — `docs/CoPilots_Launchpad_Product_Overview.pdf`: polished deck with screenshots
- **Architecture decisions** — Electron main/renderer split, electron-store with AES-256 for credentials, IPC bridge for secure communication, playwright-core with `channel: 'msedge'`, detach-after-login pattern, per-user install (no admin rights)
- **Admin rights analysis** — confirmed zero admin requirements across install, runtime, and all file operations
- **Project docs** — CLAUDE.md, README.md, CURRENT_STATE.md, NOW.md, CHANGELOG.md, .gitignore
