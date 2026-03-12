# CoPilots Launchpad -- User Guide

A step-by-step onboarding guide for first-time users. Setup takes about 5 minutes.

---

## What is it?

CoPilots Launchpad is a desktop app that lets you launch multiple Microsoft 365 test accounts with a single click. Click an account card, the browser opens, logs in automatically, and lands on the right page.

**Repo:** https://github.com/nikhilsi/copilots-launchpad

---

## Step 1: Download & Install

### macOS

1. Go to https://github.com/nikhilsi/copilots-launchpad/releases/latest
2. Download the `.dmg` file
3. Open the .dmg and drag the app to Applications
4. First launch: right-click the app > Open (macOS may warn about unidentified developer the first time)

### Windows

1. Go to https://github.com/nikhilsi/copilots-launchpad/releases/latest
2. Download the `.exe` file
3. Run the installer -- Next, Next, Finish. No admin rights needed.
4. **Windows SmartScreen:** The installer is signed with a Microsoft-verified certificate (Azure Trusted Signing). If you still see a SmartScreen prompt on early releases, click **"More info"** then **"Run anyway"** -- reputation builds over time with signed downloads.

---

## Step 2: Check Destinations

The app comes with one destination pre-configured:

- **Copilot Chat** -- `https://m365.cloud.microsoft/chat`

If you need additional destinations (e.g., Admin Center):

1. Open the app -- it starts on the Launcher
2. Click the **gear icon** (top right) to go to **Settings**
3. Click the **Destinations** tab
4. Click **+ Add Destination**
5. Enter:
   - **Label:** e.g., `Admin Center`
   - **URL:** e.g., `https://admin.microsoft.com`
6. Click **Add Destination**

---

## Step 3: Add Accounts

You have two options: **manual** (one at a time) or **CSV import** (bulk).

### Option A: Manual

1. Go to Settings > **Accounts** tab
2. Click **+ Add Account**
3. Fill in:
   - **Friendly Label:** A name you'll recognize (e.g., "Test Premium")
   - **Username / Email:** The M365 login email
   - **Password:** The account password
   - **Group:** A category name (e.g., "Admins", "Testers") -- accounts are grouped by this on the Launcher
   - **Destination:** Select from the dropdown (e.g., "Copilot Chat")
   - **Color:** Pick a color for the group accent
   - **Notes:** Optional
4. Click **Add Account**

### Option B: CSV Import (recommended for many accounts)

1. **Download the [sample CSV template](sample-accounts.csv)** or prepare your own in a spreadsheet app (Excel, Google Sheets, etc.) with these columns:

   | Column | Required? | Notes |
   |--------|-----------|-------|
   | `label` | Yes | Friendly name (e.g., "Test Premium") |
   | `username` | Yes | M365 email address |
   | `password` | Yes | Account password |
   | `destination` | No | Must match a destination label you already added (e.g., "Copilot Chat"). If omitted, you pick a default during import. |
   | `group` | No | Category name (e.g., "Admins"). If omitted, defaults to "Default" (editable during import). |
   | `color` | No | Hex color like `#6366F1`. If omitted, you pick during import. |
   | `notes` | No | Any extra context |

   **Example CSV (minimum -- 3 columns):**

   ```csv
   label,username,password
   Test Premium,alice@contoso.onmicrosoft.com,P@ssword1
   Test Basic,bob@contoso.onmicrosoft.com,P@ssword2
   Global Admin,admin@contoso.onmicrosoft.com,P@ssword3
   ```

   **Example CSV (all columns):**

   ```csv
   label,username,password,destination,group,color,notes
   Test Premium,alice@contoso.onmicrosoft.com,P@ss1,Copilot Chat,Test,#10B981,Full license
   Global Admin,admin@contoso.onmicrosoft.com,P@ss2,Copilot Chat,Admins,#6366F1,Tenant admin
   ```

   **Tips:**
   - Column order doesn't matter -- the app matches by header name
   - Extra columns are ignored
   - Save as `.csv` (UTF-8 encoding)

2. In the app: Settings > Accounts > click **Import**
3. Select your CSV file
4. The **Import Preview** screen appears:
   - **Defaults bar** at the top: pick a destination, group, and color for any rows missing those values
   - **Preview table** shows each row with a status:
     - **Ready** -- will be imported (checked by default)
     - **Exists** -- username already in the app (disabled -- delete the existing account first if you need to update it)
     - **Invalid** -- missing required field (disabled)
   - Uncheck any rows you want to skip
5. Click **Import N accounts**
6. You'll see a success banner and be taken back to Settings

---

## Step 4: Launch!

1. Click **Back to Launcher** (top left of Settings)
2. You'll see your accounts organized in groups with colored cards
3. **Click any card** -- the browser opens, logs in, and lands on your destination
4. The status dot on the card turns **yellow** (launching) then **green** (done)
5. The browser stays open as a normal window -- the app just gets you in

---

## Switching Browsers

The app supports **Google Chrome** and **Microsoft Edge**.

1. Settings > **General** tab
2. Click the browser you want
3. Each browser maintains separate sessions, so switching browsers requires a fresh login

Default: Chrome on macOS, Edge on Windows.

---

## CSV Export (Backup)

To export your accounts:

1. Settings > Accounts > click **Export**
2. Choose whether to **Include passwords** (warning: exports in plaintext)
3. A CSV file downloads with all your accounts

---

## Other Features

- **Search:** Use the search bar on the Launcher to filter by name, email, group, or destination
- **Dark mode:** Click the theme icons (sun / moon / monitor) in the top right
- **System tray:** Closing the window doesn't quit the app -- it minimizes to the system tray. Click the tray icon to reopen. Right-click the tray icon > Quit to actually exit.
- **Session persistence:** After the first login, the browser remembers the session. Next launch may skip login entirely.

---

## Important Notes

- This app is designed for **test tenants with MFA disabled**. It does not handle MFA prompts.
- Passwords are encrypted on your machine using the OS keychain (macOS Keychain / Windows DPAPI). They never leave your device unless you explicitly export them.
- Each account gets its own isolated browser profile -- accounts don't interfere with each other.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Windows says "Unverified publisher" | The app is signed, but SmartScreen reputation builds over time. Click "More info" then "Run anyway." |
| macOS says "unidentified developer" | Right-click the app > Open (first time only) |
| macOS asks for Automation permission | System Settings > Privacy & Security > Automation > allow the app |
| Browser doesn't open | Make sure Chrome or Edge is installed |
| Login gets stuck | The account may have MFA enabled -- this app only works with MFA disabled |
| Card shows red dot | An error occurred during login -- hover over the dot for details |
