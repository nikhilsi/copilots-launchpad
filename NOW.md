# NOW - What's Next

---
**Last Updated**: March 6, 2026
**Purpose**: What to work on next
**Context**: See CURRENT_STATE.md for what's built, CHANGELOG.md for history
---

## Phase 1–4 — DONE

- [x] Scaffold (Vite + React + Tailwind + Electron)
- [x] Electron shell, system tray, credential store, IPC
- [x] Full React UI with dark/light/system theme
- [x] Playwright login flow with scenario detection and detach
- [x] Production builds (Windows .exe, macOS .dmg)
- [x] Cross-platform support (macOS + Windows)
- [x] Configurable browser (Chrome/Edge) with platform-aware defaults
- [x] Spec doc updated to v1.1

## Security & Polish — DONE

- [x] Electron safeStorage (OS keychain encryption)
- [x] IPC input validation (types, URLs, colors, channels)
- [x] Path traversal protection
- [x] Accessibility (ARIA roles, keyboard navigation, focus indicators)
- [x] CSP hardened
- [x] MIT license

## CSV Import/Export — DONE

- [x] CSV export with optional password inclusion
- [x] CSV import with file picker and custom parser
- [x] Import preview screen (defaults bar, conflict detection, selective import)
- [x] Design spec (`docs/0.8.0-csv-import-export-spec.md`)

## GitHub Actions — DONE

- [x] Release workflow on `v*` tag push (macOS .dmg + Windows .exe)
- [x] Automated GitHub Release with artifacts

## macOS Testing — DONE

- [x] Chrome + Edge launch, profile isolation, browser switching
- [x] Multiple accounts, search, dark mode, delete cleanup, tray, persistence
- [x] CSV import and export

## Windows Testing — NEXT

- [ ] Tag and push to trigger release build
- [ ] Download Windows .exe from GitHub Release
- [ ] Test installer on Windows 11 (no admin rights, Start Menu entry, tray icon)
- [ ] Test with real M365 test accounts (Copilot Chat, Admin Center destinations)

---

## Phase 5: V2 (Future — Out of Scope for V1)

- [ ] One account, multiple destinations (button per destination or right-click menu)
- [ ] Session health check (background ping, stale indicators)
- [ ] Auto-update (Electron auto-updater)
- [ ] Keyboard shortcuts (quick-launch by number)
- [ ] Account ordering (drag-and-drop within groups)
- [ ] Run on startup (optional toggle)
