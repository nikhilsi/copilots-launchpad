# NOW - What's Next

---
**Last Updated**: March 6, 2026
**Purpose**: What to work on next
**Context**: See CURRENT_STATE.md for what's built, CHANGELOG.md for history
---

## Phase 1–3 — DONE

- [x] Scaffold (Vite + React + Tailwind + Electron)
- [x] Electron shell, system tray, credential store, IPC
- [x] Full React UI with dark/light/system theme
- [x] Playwright login flow with scenario detection and detach

## Phase 4: Build & Ship — IN PROGRESS

- [x] `npm run build` → React production build (verified)
- [x] `npm run dist:win` → cross-compiled Windows .exe from macOS (80MB NSIS installer)
- [x] App icon (.ico) and dist scripts (`dist:win`, `dist:mac`)
- [ ] Test installer on Windows 11 (no admin rights, Start Menu entry, tray icon)
- [ ] Test with real M365 test accounts (Copilot Chat, Admin Center destinations)
- [ ] Test simultaneous sessions (2-3 accounts open side by side)
- [ ] Deliver .exe to user

---

## Phase 5: V2 (Future — Out of Scope for V1)

- [ ] One account, multiple destinations (button per destination or right-click menu)
- [ ] Session health check (background ping, stale indicators)
- [ ] Import/export accounts (JSON backup)
- [ ] Auto-update (Electron auto-updater)
- [ ] Keyboard shortcuts (quick-launch by number)
- [ ] Account ordering (drag-and-drop within groups)
- [ ] Run on Windows startup (optional toggle)
