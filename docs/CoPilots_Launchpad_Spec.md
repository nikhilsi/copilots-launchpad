# CoPilots Launchpad — Design & Technical Architecture Spec

**Version:** 1.1
**Date:** March 6, 2026
**Status:** Implemented

---

## 1. Overview

### What It Is
CoPilots Launchpad is a lightweight Electron desktop app for Windows and macOS that lets a user manage and launch multiple Microsoft 365 test accounts with a single click. Each click opens a browser (Chrome or Edge, configurable), automatically logs in with the selected account's credentials, and navigates to a configurable destination URL (e.g., Copilot Chat, M365 Admin Center).

### The Problem
A QA/test user manages ~20 test accounts across different M365 license tiers and roles. Each day, they need to log in and out of these accounts repeatedly. Remembering which browser profile maps to which account is painful, and the manual login flow (navigate → username → password → redirects → "Stay signed in?") is tedious.

### The Solution
One app. One click. The browser opens, logs in, lands on the right page. The app sits in the system tray and stays out of the way until needed. Accounts, credentials, destination URLs, and browser preference are all configurable through a built-in settings screen.

### Key Design Principle
**Delight the user.** Logging in should feel effortless, not like work.

---

## 2. Data Model

### Destinations

Configurable target URLs. Not hardcoded — the user can add, edit, and remove destinations.

```json
{
  "id": "dest-01",
  "label": "Copilot Chat",
  "url": "https://m365.cloud.microsoft/chat"
}
```

| Field | Type   | Required | Notes                          |
|-------|--------|----------|--------------------------------|
| id    | string | yes      | Auto-generated unique ID       |
| label | string | yes      | Friendly display name          |
| url   | string | yes      | Full URL including https://    |

### Accounts

Each account maps to one destination and one freeform group.

```json
{
  "id": "acc-01",
  "label": "Global Admin",
  "username": "globaladmin@contoso.onmicrosoft.com",
  "password": "P@ssw0rd123",
  "group": "Admins",
  "color": "#6366F1",
  "destinationId": "dest-01",
  "notes": "Full M365 Copilot license, all features enabled",
  "status": "idle"
}
```

| Field         | Type   | Required | Notes                                      |
|---------------|--------|----------|---------------------------------------------|
| id            | string | yes      | Auto-generated unique ID                    |
| label         | string | yes      | Friendly display name shown on card         |
| username      | string | yes      | Full email/UPN for login                    |
| password      | string | yes      | Stored encrypted via electron-store         |
| group         | string | yes      | Freeform — user types whatever they want    |
| color         | string | yes      | Hex color for group visual identity         |
| destinationId | string | yes      | References a Destination ID                 |
| notes         | string | no       | Optional context (license type, etc.)       |
| status        | string | auto     | Runtime only: idle / launching / open       |

### Storage

All data stored locally using `electron-store` with encryption enabled. Credentials never leave the machine. The store file lives in the standard Electron app data directory (`%APPDATA%/copilots-launchpad/`).

---

## 3. Browser Profile Management

Each account gets its own isolated browser profile directory, namespaced by browser channel. This enables:

- **Simultaneous sessions:** Multiple accounts open in separate browser windows at the same time, side by side
- **Session persistence:** Cookies and auth tokens persist between launches, so if a session is still valid, the login flow is skipped entirely — instant launch
- **Browser independence:** Switching between Chrome and Edge doesn't corrupt profiles — cookies are encrypted per-browser and aren't portable

### Configurable Browser

The user can choose between **Google Chrome** and **Microsoft Edge** in Settings → General. The default is platform-aware:

| Platform | Default Browser |
|----------|----------------|
| macOS    | Google Chrome   |
| Windows  | Microsoft Edge  |

The setting is stored in electron-store as `browserChannel` (`'chrome'` or `'msedge'`).

### Profile Directory Structure

Profiles are namespaced by browser channel to prevent cross-contamination:

```
<app-data>/copilots-launchpad/
├── config.json              # electron-store (encrypted accounts + destinations + settings)
└── profiles/
    ├── chrome/
    │   ├── acc-01/          # Chrome user data dir for account acc-01
    │   └── acc-02/
    └── msedge/
        ├── acc-01/          # Edge user data dir for account acc-01
        └── acc-02/
```

- **macOS:** `<app-data>` = `~/Library/Application Support/`
- **Windows:** `<app-data>` = `%APPDATA%/`

### Important: These Are NOT Browser UI Profiles

These profiles are **not** the profiles visible in the browser's built-in profile picker. Playwright uses the `--user-data-dir=<path>` command-line flag, which tells the browser to use a completely separate folder for all its data — cookies, sessions, cache, local storage. The browser's own profile manager has no awareness of these directories. They are invisible, isolated sandboxes.

This is intentional and preferable:
- No confusion with the user's "real" browser profiles
- No clutter in the browser's profile switcher UI
- Fully managed by the app — created, used, and cleaned up automatically
- No registry access required — `--user-data-dir` is a standard command-line argument pointing to a regular folder on disk

### Admin Rights — Not Required

| Action                    | Admin Required? | Notes                                                   |
|---------------------------|----------------|---------------------------------------------------------|
| Install the app           | No             | Per-user install (NSIS on Windows, .dmg on macOS) |
| Run the app               | No             | Creates folders in app data, launches browser with flags |
| Create profile directories | No            | Standard user-writable folders under app data            |
| Launch browser via Playwright | No         | Uses the system-installed Chrome/Edge with a command-line flag |

The entire install and daily-use experience is fully admin-free.

### Profile Lifecycle

- **Created** automatically when an account is added (or on first launch of that account)
- **Reused** on every subsequent launch — sessions persist
- **Deleted** when an account is removed from settings (with confirmation) — profiles are deleted across all browser channels

---

## 4. Playwright Login Flow

The app uses `playwright-core` with the configured browser channel (`'chrome'` or `'msedge'`) to drive the system-installed browser. No extra browser is bundled.

### Launch Sequence

When the user clicks an account card:

1. App resolves the account's profile directory (namespaced by browser channel) and destination URL
2. Playwright launches the browser with `--user-data-dir=<profile path>` using the configured channel
3. Navigates to the destination URL
4. Detects which scenario it's in (see below)
5. Completes login if needed
6. Detaches from the browser — it stays open as a normal window under user control
7. Sends status update back to the UI

### Scenario Detection

After navigation, the app races three selectors simultaneously using `Promise.race`. Whichever element appears first determines the flow:

| Selector Detected                    | Scenario               | Action                              |
|--------------------------------------|------------------------|-------------------------------------|
| Copilot Chat / destination UI element | A — Session alive      | Done. Mark status green.            |
| `input[name="loginfmt"]`            | B — Login required     | Run credential flow (see below)     |
| Account picker screen                | C — Stale session      | Click "Use another account" → Flow B |

### Credential Flow (Scenario B)

```
1. Wait for input[name="loginfmt"] → fill with username
2. Click input[type="submit"] (Next button)
3. Wait for input[name="passwd"] → fill with password
4. Click input[type="submit"] (Sign In button)
5. If "Stay signed in?" prompt appears:
   - Wait for "Yes" button → click it (enables session persistence)
6. Wait for destination page to load → done
```

### Important Behaviors

- **No MFA:** The test tenant has MFA disabled. If MFA is ever enabled, the flow will need an additional handler.
- **Timeout handling:** If any step takes longer than 30 seconds, the app should report an error status on the card rather than hanging silently.
- **Detach after login:** Once the destination page loads, Playwright disconnects. The browser window becomes a normal session. The app does not maintain control.

---

## 5. Application Architecture

### Tech Stack

| Component        | Technology                | Purpose                                     |
|------------------|---------------------------|---------------------------------------------|
| App shell        | Electron                  | Desktop app framework, system tray, IPC     |
| UI               | React + Tailwind CSS      | Launcher and Settings screens               |
| Browser automation | playwright-core          | Chrome/Edge login automation (lighter than full Playwright) |
| Data storage     | electron-store (encrypted) | Account credentials, destinations, settings |
| Packaging        | electron-builder          | Windows .exe and macOS .dmg installer generation |

### Process Architecture

Electron has two processes. The security boundary between them is critical.

**Main Process (Node.js):**
- System tray management
- Window creation
- IPC message handling
- Playwright login flow execution
- Profile directory management
- Reading/writing encrypted store

**Renderer Process (React):**
- All UI rendering
- Sends IPC messages to main process for actions
- Never touches the file system, Playwright, or credentials directly

### IPC Messages

| Channel               | Direction         | Payload                    | Purpose                         |
|------------------------|-------------------|----------------------------|---------------------------------|
| `accounts:list`       | Renderer → Main   | none                       | Request all accounts            |
| `accounts:add`        | Renderer → Main   | Account                    | Add a new account               |
| `accounts:update`     | Renderer → Main   | Account                    | Update an existing account      |
| `accounts:delete`     | Renderer → Main   | { id }                     | Delete an account + profile     |
| `destinations:list`   | Renderer → Main   | none                       | Request all destinations        |
| `destinations:add`    | Renderer → Main   | Destination                | Add a new destination           |
| `destinations:update` | Renderer → Main   | Destination                | Update an existing destination  |
| `destinations:delete` | Renderer → Main   | { id }                     | Delete a destination            |
| `launch:account`      | Renderer → Main   | { id }                     | Trigger login flow for account  |
| `launch:status`       | Main → Renderer   | { id, status, error? }     | Status update during launch     |
| `theme:get`           | Renderer → Main   | none                       | Get current theme preference    |
| `theme:set`           | Renderer → Main   | theme                      | Set theme (light/dark/system)   |
| `browser:get`         | Renderer → Main   | none                       | Get browser channel preference  |
| `browser:set`         | Renderer → Main   | channel                    | Set browser (chrome/msedge)     |

### Folder Structure

```
copilots-launchpad/
├── package.json
├── electron/
│   ├── main.js                # Electron main process entry
│   │                          #   - Creates BrowserWindow
│   │                          #   - Sets up system tray
│   │                          #   - Registers all IPC handlers
│   │                          #   - Manages app lifecycle
│   ├── preload.js             # Context bridge between main and renderer
│   │                          #   - Exposes safe IPC methods to React
│   ├── launcher.js            # Playwright login flow
│   │                          #   - launchAccount(account, destination, channel, onStatus)
│   │                          #   - Scenario detection (A/B/C)
│   │                          #   - Credential filling
│   │                          #   - Status callbacks
│   │                          #   - Profile directory management (create/delete/getPath)
│   │                          #   - Profiles namespaced by browser channel
│   └── store.js               # electron-store wrapper
│                               #   - CRUD for accounts and destinations
│                               #   - Theme and browser channel preferences
│                               #   - Encryption config
├── src/
│   ├── App.jsx                # Root component, view routing
│   ├── components/
│   │   ├── AccountCard.jsx    # Individual account card with status
│   │   ├── GroupSection.jsx   # Collapsible group with header
│   │   ├── SearchBar.jsx     # Search/filter input
│   │   ├── StatusIndicator.jsx # Dot indicator (idle/launching/open)
│   │   ├── AccountModal.jsx  # Add/edit account form modal
│   │   ├── DestModal.jsx     # Add/edit destination form modal
│   │   ├── ThemeToggle.jsx   # Dark/light/system theme toggle
│   │   └── Icons.jsx         # SVG icon components
│   ├── pages/
│   │   ├── Launcher.jsx      # Home screen — account cards grouped
│   │   └── Settings.jsx      # Settings — Accounts + Destinations tabs
│   ├── hooks/
│   │   ├── useAccounts.js    # IPC hooks for account CRUD
│   │   ├── useDestinations.js # IPC hooks for destination CRUD
│   │   └── useTheme.js       # Theme state management + OS preference detection
│   └── styles/
│       └── index.css          # Tailwind imports + custom styles
├── assets/
│   ├── icon.ico               # App icon for Windows
│   └── tray-icon.png          # System tray icon (16x16 or 32x32)
├── profiles/                  # Git-ignored, created at runtime
├── build/                     # electron-builder output
├── electron-builder.yml       # Build/packaging configuration
└── tailwind.config.js
```

---

## 6. UI Design

### Screen 1: Launcher (Home)

**Top bar (sticky):**
- Left: App logo + "CoPilots Launchpad" title
- Center: Search box — filters across label, username, group, and destination name
- Right: Gear icon → navigates to Settings

**Main area:**
- Accounts displayed as cards in a responsive grid (auto-fill, min 270px per card)
- Cards are automatically grouped by the `group` field
- Each group is a collapsible section with a colored header showing the group name and account count

**Account Card anatomy:**
- Left border stripe in the group's color
- Friendly label (large, prominent)
- Username (smaller, monospace, truncated with ellipsis)
- Destination pill/badge (bottom left, colored)
- Notes (bottom right, small italic, if present)
- Status dot (top right): gray = idle, yellow/spinning = launching, green = browser open

**Card interaction:**
- Hover: subtle lift (translateY -2px), border glow in group color
- Click: triggers launch, card pulses during login flow
- Status dot updates in real-time via IPC

**Empty states:**
- No accounts match search: "No accounts match your search."
- No accounts configured: "Welcome! Add your first account in Settings."

### Screen 2: Settings

**Navigation:** Back arrow + "Back to Launcher" link in the top bar

**Tab bar:** Three tabs — Accounts | Destinations | General

**Accounts tab:**
- Header: account count + "Add Account" button
- Table layout: Label | Username | Destination | Group | Actions (edit, delete)
- Edit opens modal (see below)
- Delete with confirmation

**Destinations tab:**
- Header: destination count + "Add Destination" button
- Table layout: Label | URL | Actions (edit, delete)
- Cannot delete a destination that is assigned to one or more accounts (show warning)
- Edit opens modal

**General tab:**
- **Browser:** Choose between Google Chrome and Microsoft Edge. Profiles are isolated per browser — switching browsers requires a fresh login. Default: Chrome on macOS, Edge on Windows.

### Theme

The app supports three theme modes, toggled via a sun/moon/monitor icon control visible on both Launcher and Settings screens:

| Mode   | Behavior |
|--------|----------|
| Light  | Light background, dark text |
| Dark   | Dark background (#0C0F1A), light text |
| System | Follows the OS preference via `prefers-color-scheme` |

Theme preference is persisted in electron-store and applied via Tailwind's `darkMode: 'class'` strategy (toggling the `dark` class on `<html>`).

### Modals

**Account Modal (Add/Edit):**
- Fields: Label, Username, Password (masked + show/hide toggle), Group (freeform text), Destination (dropdown of existing destinations), Color (palette picker — 8 preset colors), Notes (optional)
- Buttons: Cancel | Add Account (or Save Changes)

**Destination Modal (Add/Edit):**
- Fields: Label, URL
- Buttons: Cancel | Add Destination (or Save Changes)

### Visual Design

- **Theme:** Dark/light/system mode (see Theme section above)
- **Dark palette:** background #0C0F1A, light text
- **Light palette:** background gray-50, dark text
- **Typography:** DM Sans (UI) + JetBrains Mono (usernames, URLs)
- **Accent:** Indigo (#6366F1) as primary action color
- **Cards:** subtle glass-like appearance with rgba backgrounds, full dark: variants
- **Animations:** card hover lift, launch pulse, status dot transitions

---

## 7. System Tray Behavior

- App starts minimized to the system tray (after first-time setup)
- Tray icon click: opens/focuses the launcher window
- Tray right-click menu:
  - "Open Launcher"
  - Separator
  - "Quit"
- Window close button (X): minimizes to tray rather than quitting
- App runs on Windows startup (optional, configurable)

---

## 8. Development & Build

### Development Environment

- **Develop on macOS** — Electron, React, and Playwright all run cross-platform
- **Default browser channel:** Chrome on macOS, Edge on Windows (configurable in Settings → General)
- **Testing on Windows 11** — validate Edge integration and NSIS installer

### Build & Packaging

Use `electron-builder` to produce platform-specific installers:
- **Windows:** `.exe` installer (NSIS-based), per-user install to `%LOCALAPPDATA%`
- **macOS:** `.dmg` installer
- The installer bundles: Node.js runtime (via Electron), React app, playwright-core, electron-store, all npm dependencies
- **Not bundled:** Chrome/Edge browsers (must be pre-installed on the target machine)

### Build Scripts

```bash
npm run build        # Build React production bundle
npm run dist:win     # Package Windows .exe (NSIS installer)
npm run dist:mac     # Package macOS .dmg
```

### Delivery

1. Run `npm run build` then `npm run dist:win` or `npm run dist:mac`
2. Output: platform-specific installer in `dist/`
3. Send to user
4. User runs installer (no admin rights needed)
5. First launch opens Settings to add accounts and destinations

---

## 9. Security Considerations

- **Credentials encrypted at rest** via electron-store's encryption (AES-256)
- **Credentials never in renderer process** — only the main process reads/writes the store
- **Profile directories are local** — session cookies stay on the machine
- **No registry access** — browser profiles use `--user-data-dir` (a command-line flag), not registry keys
- **No admin rights required** — install is per-user, runtime uses only user-writable paths
- **No network calls from the app itself** — only Playwright drives the browser to Microsoft URLs
- **No modification to browser installation** — the app uses the system-installed Chrome/Edge as-is
- **Test tenant only** — MFA is disabled; this app is designed for test environments, not production accounts

---

## 10. Future Considerations (V2)

These are out of scope for V1 but worth noting for future iterations:

- **One account, multiple destinations:** Launch the same account to different URLs (button per destination on the card, or a right-click context menu)
- **Session health check:** Background ping to detect if sessions have expired, show stale indicators on cards
- **Import/export accounts:** JSON export for backup or sharing across machines
- **Auto-update:** Electron auto-updater for seamless app updates
- **Keyboard shortcuts:** Quick-launch accounts by number or shortcut key
- **Account ordering:** Drag-and-drop reordering within groups
- **Run on startup:** Windows startup integration (optional toggle in settings)

---

## 11. Interactive Prototype

A working React prototype of the UI is available (built during design phase). It demonstrates the launcher view, settings screens, account/destination CRUD modals, search/filter, collapsible groups, and launch animation. Use it as the visual reference when implementing.
