import { BackIcon } from '../components/Icons';

export default function Help({ onBack }) {
  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between py-5 border-b border-black/[0.06] dark:border-white/[0.06] sticky top-0 bg-gray-50 dark:bg-[#0C0F1A] z-50 mb-7 transition-colors">
        <button className="flex items-center gap-1.5 bg-none border-none text-slate-500 dark:text-slate-400 cursor-pointer text-sm font-medium font-sans p-0 hover:text-slate-700 dark:hover:text-slate-200"
          onClick={onBack}>
          <BackIcon /> Back to Launcher
        </button>
        <div className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-50">Help</div>
        <div className="w-[120px]" /> {/* spacer for centering */}
      </div>

      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-6 max-h-[65vh] overflow-y-auto pr-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-2">Quick Start</h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Check Destinations</strong> — the app comes with Copilot Chat pre-configured. Add more in Settings &gt; Destinations (e.g., Admin Center).</li>
              <li><strong>Add Accounts</strong> — go to Settings &gt; Accounts and click + Add Account, or use Import to bulk-load from a CSV file.</li>
              <li><strong>Launch</strong> — go back to the Launcher and click any account card. The browser opens, logs in, and lands on your destination.</li>
            </ol>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-2">CSV Import</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-2">Import accounts from a CSV file with these columns:</p>
            <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 font-mono text-xs mb-2">
              label, username, password, destination, group, color, notes
            </div>
            <p className="text-slate-500 dark:text-slate-500 text-xs">Only label, username, and password are required. Column order doesn't matter. Download a <a href="https://github.com/nikhilsi/copilots-launchpad/blob/main/docs/sample-accounts.csv" target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">sample CSV template</a>.</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-2">Features</h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Search</strong> — use the search bar on the Launcher to filter by name, email, group, or destination.</li>
              <li><strong>Dark mode</strong> — click the theme icons (sun/moon/monitor) in the top right.</li>
              <li><strong>Browser choice</strong> — switch between Chrome and Edge in Settings &gt; General. Each browser has separate sessions.</li>
              <li><strong>System tray</strong> — closing the window minimizes to tray. Right-click tray icon &gt; Quit to exit.</li>
              <li><strong>Session persistence</strong> — after first login, the browser remembers the session. Next launch may skip login.</li>
              <li><strong>Auto-update</strong> — the app checks for updates on launch. You can also check manually from the tray icon menu.</li>
              <li><strong>Send logs</strong> — having issues? Go to Settings &gt; General &gt; "Send Logs via Email" to share logs for debugging.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-2">Troubleshooting</h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-400">
              <div><strong>Browser doesn't open</strong> — make sure Chrome or Edge is installed.</div>
              <div><strong>Login gets stuck</strong> — the account may have MFA enabled. This app only works with MFA disabled.</div>
              <div><strong>Card shows red dot</strong> — an error occurred during login. Go to Settings &gt; General &gt; Send Logs for details.</div>
              <div><strong>Windows "Unverified publisher"</strong> — the app is signed, but SmartScreen reputation builds over time. Click "More info" then "Run anyway."</div>
              <div><strong>macOS "unidentified developer"</strong> — right-click the app &gt; Open (first time only).</div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-2">Important Notes</h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>Designed for <strong>test tenants with MFA disabled</strong>. Does not handle MFA prompts.</li>
              <li>Passwords are encrypted using the OS keychain (macOS Keychain / Windows DPAPI). They never leave your device unless you export them.</li>
              <li>Each account gets its own isolated browser profile.</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
            <a href="https://github.com/nikhilsi/copilots-launchpad/blob/main/docs/user-guide.md"
              target="_blank" rel="noopener noreferrer"
              className="text-accent-light hover:underline text-sm font-medium">
              Full User Guide on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
