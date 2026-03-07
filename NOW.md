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

## Testing — NEXT

- [ ] Test on macOS with Chrome (dev environment)
- [ ] Test browser switching (Chrome ↔ Edge) in Settings → General
- [ ] Test installer on Windows 11 (no admin rights, Start Menu entry, tray icon)
- [ ] Test with real M365 test accounts (Copilot Chat, Admin Center destinations)
- [ ] Test simultaneous sessions (2-3 accounts open side by side)
- [ ] Deliver installer to user

---

## Phase 5: V2 (Future — Out of Scope for V1)

- [ ] One account, multiple destinations (button per destination or right-click menu)
- [ ] Session health check (background ping, stale indicators)
- [ ] Import/export accounts (JSON backup)
- [ ] Auto-update (Electron auto-updater)
- [ ] Keyboard shortcuts (quick-launch by number)
- [ ] Account ordering (drag-and-drop within groups)
- [ ] Run on startup (optional toggle)
