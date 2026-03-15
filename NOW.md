# NOW - What's Next

---
**Last Updated**: March 15, 2026
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

## Bug Fixes & Documentation — DONE

- [x] Account picker login fix (issue #3) — multi-selector approach
- [x] Sample CSV template (issue #1)
- [x] Default destination (Copilot Chat) seeded on first run
- [x] User guide (`docs/user-guide.md`)
- [x] Screenshots in README
- [x] App name fix (productName in package.json)

## Windows Code Signing — DONE (pending verification)

- [x] Azure Trusted Signing account + certificate profile
- [x] Identity validation (Urmila Singhal, Public Trust)
- [x] App registration with GitHub OIDC federated credential + client secret
- [x] IAM role assignments (Certificate Profile Signer + Identity Verifier)
- [x] GitHub secrets set (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET)
- [x] electron-builder upgraded to v26.0.1
- [x] `azureSignOptions` added to electron-builder.yml
- [x] Release workflow updated to pass Azure env vars on Windows build

## macOS Testing — DONE

- [x] Chrome + Edge launch, profile isolation, browser switching
- [x] Multiple accounts, search, dark mode, delete cleanup, tray, persistence
- [x] CSV import and export

## Auto-Update, Login Fix, Help — DONE

- [x] Auto-updater (electron-updater, in-app banner, tray menu)
- [x] Login flow overhaul (sequential detection, sign-in button, account tile click, password-only)
- [x] Help tab in Settings (quick start, CSV guide, troubleshooting)
- [x] Tooltips on form fields
- [x] Send Logs via email (Settings > General > Troubleshooting)
- [x] Logger module (ring buffer, timestamps)
- [x] Signed build verified (v0.8.4) — issue #2 closed

## Release v0.9.0 — NEXT

- [ ] Commit, push, tag v0.9.0
- [ ] Urmila downloads v0.9.0 .exe (last manual install — auto-update from here on)
- [ ] Urmila retests account picker login (issue #3)
- [ ] Test auto-update works (tag v0.9.1 later, verify in-app banner appears)
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
