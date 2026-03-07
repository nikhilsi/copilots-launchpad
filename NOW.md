# NOW - What's Next

---
**Last Updated**: March 6, 2026
**Purpose**: What to work on next
**Context**: See CURRENT_STATE.md for what's built, CHANGELOG.md for history
---

## Phase 1: Scaffold & Electron Shell — DONE

### 1a: Project Setup
- [x] Initialize npm project with Electron, React, Tailwind
- [x] Configure Vite for Electron renderer
- [x] Set up electron-builder.yml (NSIS, per-user, Windows target)
- [x] Verify `npm run dev` launches Electron window with React

### 1b: Electron Main Process
- [x] `electron/main.js` — BrowserWindow creation, dev vs prod URL loading
- [x] `electron/preload.js` — contextBridge exposing IPC channels
- [x] System tray — icon, click to open, right-click menu (Open Launcher, Quit)
- [x] Window close → minimize to tray (not quit)

### 1c: Credential Store
- [x] `electron/store.js` — electron-store with encryption enabled
- [x] IPC handlers: `accounts:list`, `accounts:add`, `accounts:update`, `accounts:delete`
- [x] IPC handlers: `destinations:list`, `destinations:add`, `destinations:update`, `destinations:delete`
- [x] Verify credentials never reach renderer as plaintext (password masked in list responses)

---

## Phase 2: React UI — DONE

### 2a: Port Prototype
- [x] Port `docs/CopilotLauncher.jsx` to proper component structure (see CLAUDE.md for file layout)
- [x] Wire components to IPC hooks (`useAccounts.js`, `useDestinations.js`)
- [x] Launcher view: account cards, grouped by group, collapsible, search/filter
- [x] Settings view: Accounts tab (table + CRUD), Destinations tab (table + CRUD)
- [x] Modals: AccountModal (add/edit), DestModal (add/edit)
- [x] Delete destination guard — cannot delete if assigned to accounts

### 2b: Visual Polish
- [x] Dark theme (background #0C0F1A, indigo accent #6366F1)
- [x] Fonts: DM Sans (UI) + JetBrains Mono (usernames, URLs)
- [x] Card hover lift, launch pulse animation, status dot transitions
- [x] Empty states (no accounts, no search results)
- [x] First launch → auto-navigate to Settings
- [x] Dark/light/system theme toggle (persisted in store)

---

## Phase 3: Playwright Integration — CURRENT

### 3a: Login Flow
- [ ] `electron/launcher.js` — Playwright launch with `channel: 'msedge'` and `--user-data-dir`
- [ ] Scenario detection via `Promise.race` (session alive / login required / stale session)
- [ ] Credential flow: username → Next → password → Sign In → Stay signed in? → Yes
- [ ] 30-second timeout per step with error reporting
- [ ] Detach after login — browser.close() on the Playwright connection, Edge stays open

### 3b: Status Updates
- [ ] IPC `launch:status` events back to renderer (launching → open / error)
- [ ] Status dot updates on account cards in real-time
- [ ] Profile directory auto-creation on first launch per account

---

## Phase 4: Build & Ship

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
