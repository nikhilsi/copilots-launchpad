# NOW - What's Next

---
**Last Updated**: March 6, 2026
**Purpose**: What to work on next
**Context**: See CURRENT_STATE.md for what's built, CHANGELOG.md for history
---

## Phase 1: Scaffold & Electron Shell — DONE

- [x] Project setup (Vite + React + Tailwind + Electron)
- [x] Electron main process, preload, system tray, close-to-tray
- [x] Credential store (electron-store, AES-256, passwords masked)

## Phase 2: React UI — DONE

- [x] Component structure, IPC hooks, Launcher + Settings pages
- [x] Modals, search/filter, collapsible groups, empty states
- [x] Dark/light/system theme toggle (persisted)

## Phase 3: Playwright Integration — DONE

- [x] `electron/launcher.js` — Playwright launch with browser channel + `--user-data-dir`
- [x] Scenario detection via `Promise.race` (session alive / login required / stale session)
- [x] Credential flow with 30s timeout per step
- [x] Detach after login — browser stays open
- [x] Status updates via IPC (launching → open / error)
- [x] Profile auto-creation on launch, deletion on account removal

---

## Phase 4: Build & Ship — CURRENT

- [ ] `npm run build` → React production build
- [ ] `npm run dist` → electron-builder packages .exe
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
