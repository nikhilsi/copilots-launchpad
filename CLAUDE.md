# Claude Code Development Guide — CoPilots Launchpad

---
**Last Updated**: March 6, 2026
**Purpose**: Rules and workflow for working with this codebase
---

## Starting a New Session

**Read these docs in order:**

1. **CLAUDE.md** (this file) — Rules & workflow
2. **README.md** — Project overview and setup
3. **CURRENT_STATE.md** — What's built & current status
4. **CHANGELOG.md** — Version history & recent changes
5. **NOW.md** — What to work on next
6. **`git log --oneline -10`** — Recent commits

**Key reference:**
- **docs/CoPilots_Launchpad_Spec.md** — Full design & technical architecture spec (the source of truth)
- **docs/CopilotLauncher.jsx** — Working React UI prototype (visual reference for implementation)
- **docs/CoPilots_Launchpad_Product_Overview.pdf** — Product overview deck

---

## Critical Rules

### Non-Negotiables
1. **Unauthorized commits** — NEVER commit without explicit approval
2. **Over-engineering** — KISS principle always. Keep it simple.
3. **Not reading requirements** — Full attention to specs, read the docs thoroughly
4. **Guessing** — Say "I don't know" if unsure
5. **Not thinking critically** — Question things that don't make sense
6. **Skipping analysis** — Don't generate code without understanding the problem first
7. **Premature abstraction** — Don't build frameworks. Build things that work.
8. **Credential exposure** — NEVER log, console.log, or commit plaintext credentials

### How to Be a True Partner
- **Thoughtful design first** — Discuss before coding
- **One piece at a time** — Complete, review, then proceed
- **KISS principle** — Simple > clever
- **Explicit permission** — Get approval before every commit
- **Challenge bad ideas** — Don't just agree
- **Ask clarifying questions** — Don't assume
- **Think consequences** — Maintenance, performance, edge cases

---

## Development Standards

### Code Quality
- **JavaScript** (Electron main process): Clear variable names, proper error handling, async/await
- **React** (renderer): Functional components, hooks, JSX (not TypeScript — keep it simple)
- **CSS**: Tailwind utility classes, inline styles where the prototype uses them

### Git Workflow
- **Atomic commits** — One logical change per commit
- **Clear messages** — Descriptive, explain the why
- **NO attribution** — Never include "Generated with Claude" or Co-Authored-By lines
- **Working state** — Every commit leaves code functional

### Documentation Discipline
- **After each phase**: Update CURRENT_STATE.md, NOW.md, CHANGELOG.md
- **Do not defer docs** — Each commit is a complete, coherent snapshot

---

## Project Summary

**CoPilots Launchpad** is a lightweight Electron desktop app for Windows that lets a user manage and launch multiple Microsoft 365 test accounts with a single click. Each click opens Microsoft Edge, automatically logs in with the selected account's credentials, and navigates to a configurable destination URL (e.g., Copilot Chat, M365 Admin Center).

### The Problem
A QA/test user manages ~20 M365 test accounts across different license tiers and roles. Logging in and out of these accounts manually — navigating to the login page, entering credentials, handling redirects, clicking "Stay signed in?" — is tedious and error-prone.

### The Solution
One app. One click. Edge opens, logs in, lands on the right page. The app sits in the system tray and stays out of the way.

### Architecture

- **Electron** — Desktop app shell, system tray, IPC bridge between main and renderer
- **React + Tailwind** — Launcher and Settings UI (renderer process)
- **playwright-core** — Browser automation, drives the system-installed Edge via `channel: 'msedge'`
- **electron-store** — Encrypted local storage for credentials (AES-256), main process only
- **Sandboxed Edge profiles** — Each account gets its own `--user-data-dir` directory for session isolation

### Key Design Decisions
- **Credentials never in renderer** — electron-store is accessed only from the main process via IPC
- **Not Edge UI profiles** — Playwright uses `--user-data-dir` flag, invisible to Edge's profile picker
- **Detach after login** — Playwright connects, automates login, disconnects. Edge becomes a normal window.
- **Session persistence** — Profile directories persist cookies, so repeat launches often skip login entirely
- **No admin rights** — Per-user install, user-writable paths only, no registry access
- **No MFA** — Test tenant only, MFA disabled

### Tech Stack

| Component | Technology |
|-----------|------------|
| App shell | Electron |
| UI | React + Tailwind CSS |
| Browser automation | playwright-core (channel: msedge) |
| Credential storage | electron-store (AES-256 encryption) |
| Packaging | electron-builder (NSIS installer) |
| Target platform | Windows 11 + Edge |
| Dev platform | macOS (cross-platform Electron + React) |

---

## Project Structure

```
copilots-launchpad/
├── CLAUDE.md                    (Development rules — this file)
├── README.md                    (Project overview + setup)
├── CURRENT_STATE.md             (What's built & status)
├── NOW.md                       (Current priorities)
├── CHANGELOG.md                 (Version history)
├── docs/
│   ├── CoPilots_Launchpad_Spec.md   (Full design spec — source of truth)
│   ├── CopilotLauncher.jsx          (UI prototype — visual reference)
│   └── CoPilots_Launchpad_Product_Overview.pdf  (Product overview deck)
│
├── electron/
│   ├── main.js                  (Electron main process — window, tray, IPC handlers)
│   ├── preload.js               (Context bridge — exposes IPC to renderer)
│   ├── store.js                 (electron-store wrapper — encrypted CRUD)
│   └── launcher.js              (Playwright login flow — scenario detection, credential fill, profile management)
│
├── src/
│   ├── App.jsx                  (Router — Launcher vs Settings view)
│   ├── components/
│   │   ├── AccountCard.jsx      (Single account card with status + launch)
│   │   ├── GroupSection.jsx     (Collapsible group with colored header)
│   │   ├── SearchBar.jsx        (Search/filter input)
│   │   ├── StatusIndicator.jsx  (Dot indicator: idle/launching/open)
│   │   ├── AccountModal.jsx     (Add/edit account form modal)
│   │   └── DestModal.jsx        (Add/edit destination form modal)
│   ├── pages/
│   │   ├── Launcher.jsx         (Home screen — account cards grouped)
│   │   └── Settings.jsx         (Settings — Accounts + Destinations tabs)
│   ├── hooks/
│   │   ├── useAccounts.js       (IPC hooks for account CRUD)
│   │   └── useDestinations.js   (IPC hooks for destination CRUD)
│   └── styles/
│       └── index.css            (Tailwind imports + custom styles)
│
├── assets/
│   ├── icon.ico                 (App icon for Windows)
│   └── tray-icon.png            (System tray icon)
├── profiles/                    (Git-ignored — Edge profile dirs, created at runtime)
├── electron-builder.yml         (Build/packaging configuration)
├── tailwind.config.js
├── package.json
└── .gitignore
```

---

## IPC Channel Reference

All communication between renderer (React) and main (Electron) goes through these IPC channels:

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `accounts:list` | renderer → main → renderer | Get all accounts |
| `accounts:add` | renderer → main | Add new account |
| `accounts:update` | renderer → main | Update existing account |
| `accounts:delete` | renderer → main | Delete account + profile dir |
| `destinations:list` | renderer → main → renderer | Get all destinations |
| `destinations:add` | renderer → main | Add new destination |
| `destinations:update` | renderer → main | Update existing destination |
| `destinations:delete` | renderer → main | Delete destination |
| `launch:account` | renderer → main | Trigger Playwright login flow |
| `launch:status` | main → renderer | Status update (launching/open/error) |

---

## Playwright Login Flow

Three scenarios detected via `Promise.race` after navigating to destination URL:

| Scenario | Detection | Action |
|----------|-----------|--------|
| A — Session alive | Destination UI element visible | Done. Status → green. |
| B — Login required | `input[name="loginfmt"]` visible | Run credential flow |
| C — Stale session | Account picker screen | Click "Use another account" → Flow B |

**Credential flow:** username → Next → password → Sign In → "Stay signed in?" → Yes → done.

**Timeout:** 30 seconds per step. Report error on card, don't hang.

**Detach:** Once destination loads, Playwright disconnects. Edge stays open normally.

---

## Quick Reference

```bash
# Development (macOS)
npm install
npm run dev                    # Start Electron in dev mode (React dev server + Electron)

# Build (produces Windows installer)
npm run build                  # Build React
npm run dist                   # Package with electron-builder → dist/

# Testing Playwright locally (macOS — use Chrome channel)
# Switch to channel: 'msedge' for Windows builds
```

---

## Current Status

See CURRENT_STATE.md for full details and NOW.md for priorities.
