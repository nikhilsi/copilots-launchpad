import { useState, useEffect } from 'react';
import useAccounts from './hooks/useAccounts';
import useDestinations from './hooks/useDestinations';
import useTheme from './hooks/useTheme';
import Launcher from './pages/Launcher';
import Settings from './pages/Settings';

export default function App() {
  const { accounts, addAccount, updateAccount, deleteAccount, importAccounts, exportAccounts, refresh: refreshAccounts } = useAccounts();
  const { destinations, addDestination, updateDestination, deleteDestination, refresh: refreshDests } = useDestinations();
  const { theme, setTheme } = useTheme();
  const [view, setView] = useState('launcher');
  const [statuses, setStatuses] = useState({});
  const [browserChannel, setBrowserChannel] = useState('chrome');

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

  return (
    <div className="min-h-screen max-w-[960px] mx-auto px-6 pb-12">
      {view === 'launcher' && (
        <Launcher
          accounts={accountsWithStatus}
          destinations={destinations}
          onNavigateSettings={() => setView('settings')}
          onLaunch={handleLaunch}
          theme={theme}
          onChangeTheme={setTheme}
        />
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
