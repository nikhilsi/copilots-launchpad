import { useState, useEffect } from 'react';
import useAccounts from './hooks/useAccounts';
import useDestinations from './hooks/useDestinations';
import useTheme from './hooks/useTheme';
import Launcher from './pages/Launcher';
import Settings from './pages/Settings';
import Help from './pages/Help';

export default function App() {
  const { accounts, addAccount, updateAccount, deleteAccount, importAccounts, exportAccounts, refresh: refreshAccounts } = useAccounts();
  const { destinations, addDestination, updateDestination, deleteDestination, refresh: refreshDests } = useDestinations();
  const { theme, setTheme } = useTheme();
  const [view, setView] = useState('launcher');
  const [statuses, setStatuses] = useState({});
  const [browserChannel, setBrowserChannel] = useState('chrome');
  const [updateStatus, setUpdateStatus] = useState(null); // null | { type, version?, percent?, message? }

  // Load browser channel preference on mount
  useEffect(() => {
    window.api.getBrowserChannel().then(setBrowserChannel);
  }, []);

  // Auto-navigate to settings on first launch (no accounts)
  useEffect(() => {
    if (accounts.length === 0 && destinations.length === 0) {
      const timer = setTimeout(() => {
        if (accounts.length === 0 && destinations.length === 0) {
          setView('settings');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [accounts.length, destinations.length]);

  // Listen for launch status updates from main process
  useEffect(() => {
    const cleanup = window.api.onLaunchStatus(({ id, status }) => {
      setStatuses((prev) => ({ ...prev, [id]: status }));
    });
    return cleanup;
  }, []);

  // Listen for auto-update events
  useEffect(() => {
    if (!window.api.onUpdateStatus) return;
    const cleanup = window.api.onUpdateStatus((status) => {
      setUpdateStatus(status);
    });
    return cleanup;
  }, []);

  const accountsWithStatus = accounts.map((a) => ({
    ...a,
    status: statuses[a.id] || 'idle',
  }));

  const handleLaunch = async (id) => {
    setStatuses((prev) => ({ ...prev, [id]: 'launching' }));
    try {
      await window.api.launchAccount(id);
    } catch (err) {
      setStatuses((prev) => ({ ...prev, [id]: 'error' }));
    }
  };

  const handleChangeBrowserChannel = async (channel) => {
    setBrowserChannel(channel);
    await window.api.setBrowserChannel(channel);
  };

  const renderUpdateBanner = () => {
    if (!updateStatus) return null;
    const { type, version, percent } = updateStatus;

    if (type === 'available') {
      return (
        <div className="bg-accent/15 border-b border-accent/30 px-4 py-2 flex items-center justify-between text-sm">
          <span className="text-accent-light">Update v{version} available</span>
          <button
            onClick={() => window.api.downloadUpdate()}
            className="px-3 py-1 bg-accent text-white rounded text-xs font-medium hover:bg-accent/90"
          >
            Download
          </button>
        </div>
      );
    }

    if (type === 'progress') {
      return (
        <div className="bg-accent/10 border-b border-accent/20 px-4 py-2 text-sm text-accent-light">
          Downloading update... {percent}%
        </div>
      );
    }

    if (type === 'downloaded') {
      return (
        <div className="bg-green-500/15 border-b border-green-500/30 px-4 py-2 flex items-center justify-between text-sm">
          <span className="text-green-600 dark:text-green-400">Update v{version} ready to install</span>
          <button
            onClick={() => window.api.installUpdate()}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
          >
            Restart & Update
          </button>
        </div>
      );
    }

    if (type === 'checking') {
      return (
        <div className="bg-accent/10 border-b border-accent/20 px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
          Checking for updates...
        </div>
      );
    }

    if (type === 'not-available') {
      // Show briefly then dismiss
      setTimeout(() => setUpdateStatus(null), 3000);
      return (
        <div className="bg-black/5 dark:bg-white/5 border-b border-black/[0.06] dark:border-white/[0.06] px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
          You're on the latest version
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen max-w-[960px] mx-auto px-6 pb-12">
      {renderUpdateBanner()}
      {view === 'launcher' && (
        <Launcher
          accounts={accountsWithStatus}
          destinations={destinations}
          onNavigateSettings={() => setView('settings')}
          onNavigateHelp={() => setView('help')}
          onLaunch={handleLaunch}
          theme={theme}
          onChangeTheme={setTheme}
        />
      )}
      {view === 'help' && (
        <Help onBack={() => setView('launcher')} />
      )}
      {view === 'settings' && (
        <Settings
          accounts={accounts}
          destinations={destinations}
          onAddAccount={addAccount}
          onUpdateAccount={updateAccount}
          onDeleteAccount={deleteAccount}
          onImportAccounts={importAccounts}
          onExportAccounts={exportAccounts}
          onAddDestination={addDestination}
          onUpdateDestination={updateDestination}
          onDeleteDestination={deleteDestination}
          onBack={() => { refreshAccounts(); refreshDests(); setView('launcher'); }}
          theme={theme}
          onChangeTheme={setTheme}
          browserChannel={browserChannel}
          onChangeBrowserChannel={handleChangeBrowserChannel}
        />
      )}
    </div>
  );
}
