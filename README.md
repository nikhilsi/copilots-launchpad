# CoPilots Launchpad

*One click. Edge opens. You're in.*

Desktop app for managing and launching multiple Microsoft 365 test accounts. Click an account card, Edge opens with auto-login, and you land on Copilot Chat (or any M365 destination). The app sits in the system tray and stays out of the way.

---

## What This Is

CoPilots Launchpad solves a specific pain: a QA/test user with ~20 M365 accounts across different license tiers and roles who needs to switch between them throughout the day. Instead of manually navigating to the login page, entering credentials, handling redirects, and clicking through "Stay signed in?" prompts — one click does all of it.

Key ideas:
- **Sandboxed Edge profiles** — each account gets its own isolated browser session via `--user-data-dir`, invisible to Edge's profile picker
- **Session persistence** — cookies persist between launches, so if a session is still valid, login is skipped entirely
- **Simultaneous sessions** — multiple accounts can be open in separate Edge windows side by side
- **Detach after login** — Playwright automates the login, then disconnects. Edge becomes a normal browser window.
- **Encrypted credentials** — stored locally via electron-store (AES-256), never leave the machine, never in the renderer process

## Tech Stack

| Component | Technology |
|-----------|------------|
| App shell | Electron |
| UI | React + Tailwind CSS |
| Browser automation | playwright-core (channel: msedge) |
| Credential storage | electron-store (AES-256 encryption) |
| Packaging | electron-builder (NSIS, per-user install) |
| Target | Windows 11 + Edge |

## Project Structure

```
copilots-launchpad/
├── electron/                  # Main process (window, tray, IPC, Playwright)
│   ├── main.js
│   ├── preload.js
│   ├── store.js
│   └── launcher.js
├── src/                       # Renderer (React UI)
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── styles/
├── assets/                    # Icons
├── profiles/                  # Git-ignored — Edge profile dirs
├── docs/                         # Design docs, prototype, product overview
│   ├── CoPilots_Launchpad_Spec.md
│   ├── CopilotLauncher.jsx
│   └── CoPilots_Launchpad_Product_Overview.pdf
├── electron-builder.yml
└── package.json
```

## Setup

```bash
npm install

# Development (macOS — uses Chrome channel for local testing)
npm run dev

# Build Windows installer
npm run build && npm run dist
# Output: dist/CoPilots-Launchpad-Setup-1.0.0.exe
```

## Installation (End User)

1. Run `CoPilots-Launchpad-Setup-1.0.0.exe`
2. Next → Next → Finish (no admin rights needed)
3. App opens → go to Settings → add destinations and accounts
4. Click any account card to launch

## Security

- Credentials encrypted at rest (AES-256 via electron-store)
- Credentials never in the renderer process — main process only, accessed via IPC
- No registry access, no admin rights, no modification to Edge installation
- Profile directories are local sandboxes — no network calls from the app itself
- **Test tenant only** — designed for environments with MFA disabled

## Status

Design spec and UI prototype complete. Implementation in progress.

See CURRENT_STATE.md for details. See NOW.md for what's next.
