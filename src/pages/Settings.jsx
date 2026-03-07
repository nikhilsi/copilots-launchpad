import { useState } from 'react';
import { BackIcon, PlusIcon, EditIcon, TrashIcon } from '../components/Icons';
import ThemeToggle from '../components/ThemeToggle';
import AccountModal from '../components/AccountModal';
import DestModal from '../components/DestModal';

export default function Settings({
  accounts, destinations,
  onAddAccount, onUpdateAccount, onDeleteAccount,
  onAddDestination, onUpdateDestination, onDeleteDestination,
  onBack, theme, onChangeTheme,
  browserChannel, onChangeBrowserChannel,
}) {
  const [tab, setTab] = useState('accounts');
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingDest, setEditingDest] = useState(null);
  const [error, setError] = useState('');

  const getDestLabel = (destId) => {
    const d = destinations.find((x) => x.id === destId);
    return d ? d.label : 'Unknown';
  };

  const handleSaveAccount = async (form) => {
    if (form.id) {
      await onUpdateAccount(form);
    } else {
      await onAddAccount(form);
    }
    setEditingAccount(null);
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm('Delete this account? The associated Edge profile will also be removed.')) return;
    await onDeleteAccount(id);
  };

  const handleSaveDest = async (form) => {
    if (form.id) {
      await onUpdateDestination(form);
    } else {
      await onAddDestination(form);
    }
    setEditingDest(null);
  };

  const handleDeleteDest = async (id) => {
    setError('');
    try {
      await onDeleteDestination(id);
    } catch (err) {
      setError(err.message || 'Cannot delete — destination is assigned to accounts.');
    }
  };

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between py-5 border-b border-black/[0.06] dark:border-white/[0.06] sticky top-0 bg-gray-50 dark:bg-[#0C0F1A] z-50 mb-7 transition-colors">
        <button className="flex items-center gap-1.5 bg-none border-none text-slate-500 dark:text-slate-400 cursor-pointer text-sm font-medium font-sans p-0 hover:text-slate-700 dark:hover:text-slate-200"
          onClick={onBack}>
          <BackIcon /> Back to Launcher
        </button>
        <div className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-50">Settings</div>
        <ThemeToggle theme={theme} onChangeTheme={onChangeTheme} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-6 shadow-sm dark:shadow-none">
        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-black/[0.03] dark:bg-white/[0.03] rounded-[10px] p-1">
          <button className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer border-none font-sans transition-colors ${tab === 'accounts' ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-none' : 'bg-transparent text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'}`}
            onClick={() => setTab('accounts')}>Accounts</button>
          <button className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer border-none font-sans transition-colors ${tab === 'destinations' ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-none' : 'bg-transparent text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'}`}
            onClick={() => setTab('destinations')}>Destinations</button>
          <button className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer border-none font-sans transition-colors ${tab === 'general' ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-none' : 'bg-transparent text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'}`}
            onClick={() => setTab('general')}>General</button>
        </div>

        {/* General tab */}
        {tab === 'general' && (
          <div>
            <div className="mb-6">
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-2 block">Browser</label>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                Choose which browser to use for launching accounts. Profiles are isolated per browser — switching browsers will require a fresh login.
              </p>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer border transition-colors ${
                    browserChannel === 'chrome'
                      ? 'bg-accent/15 text-accent-light border-accent/30'
                      : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-black/[0.08] dark:border-white/[0.08] hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                  onClick={() => onChangeBrowserChannel('chrome')}
                >
                  Google Chrome
                </button>
                <button
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer border transition-colors ${
                    browserChannel === 'msedge'
                      ? 'bg-accent/15 text-accent-light border-accent/30'
                      : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-black/[0.08] dark:border-white/[0.08] hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                  onClick={() => onChangeBrowserChannel('msedge')}
                >
                  Microsoft Edge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accounts tab */}
        {tab === 'accounts' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-500 dark:text-slate-600">{accounts.length} accounts configured</span>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent/15 text-accent-light border border-accent/30 rounded-lg text-sm font-medium cursor-pointer font-sans hover:bg-accent/25"
                onClick={() => setEditingAccount({})}>
                <PlusIcon /> Add Account
              </button>
            </div>

            <div className="grid grid-cols-[1fr_1.5fr_1fr_0.7fr_auto] gap-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-600 border-b border-black/[0.06] dark:border-white/[0.06]">
              <span>Label</span><span>Username</span><span>Destination</span><span>Group</span><span></span>
            </div>

            {accounts.map((acc) => (
              <div key={acc.id} className="grid grid-cols-[1fr_1.5fr_1fr_0.7fr_auto] gap-3 items-center px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.04] text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <span className="font-medium text-slate-800 dark:text-slate-200">{acc.label}</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-xs truncate">{acc.username}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md"
                  style={{ color: acc.color, background: `${acc.color}15` }}>
                  {getDestLabel(acc.destinationId)}
                </span>
                <span className="text-slate-400 dark:text-slate-600 text-xs">{acc.group}</span>
                <div className="flex gap-1">
                  <button className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-accent-light rounded-md bg-transparent border-none cursor-pointer"
                    onClick={() => setEditingAccount(acc)}><EditIcon /></button>
                  <button className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-red-400 rounded-md bg-transparent border-none cursor-pointer"
                    onClick={() => handleDeleteAccount(acc.id)}><TrashIcon /></button>
                </div>
              </div>
            ))}

            {accounts.length === 0 && (
              <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">No accounts yet. Click "Add Account" to get started.</div>
            )}
          </div>
        )}

        {/* Destinations tab */}
        {tab === 'destinations' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-500 dark:text-slate-600">{destinations.length} destinations configured</span>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent/15 text-accent-light border border-accent/30 rounded-lg text-sm font-medium cursor-pointer font-sans hover:bg-accent/25"
                onClick={() => setEditingDest({})}>
                <PlusIcon /> Add Destination
              </button>
            </div>

            <div className="grid grid-cols-[1fr_2fr_auto] gap-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-600 border-b border-black/[0.06] dark:border-white/[0.06]">
              <span>Label</span><span>URL</span><span></span>
            </div>

            {destinations.map((d) => (
              <div key={d.id} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-center px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.04] text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <span className="font-medium text-slate-800 dark:text-slate-200">{d.label}</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">{d.url}</span>
                <div className="flex gap-1">
                  <button className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-accent-light rounded-md bg-transparent border-none cursor-pointer"
                    onClick={() => setEditingDest(d)}><EditIcon /></button>
                  <button className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-red-400 rounded-md bg-transparent border-none cursor-pointer"
                    onClick={() => handleDeleteDest(d.id)}><TrashIcon /></button>
                </div>
              </div>
            ))}

            {destinations.length === 0 && (
              <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">No destinations yet. Click "Add Destination" to get started.</div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {editingAccount !== null && (
        <AccountModal
          account={editingAccount.id ? editingAccount : null}
          destinations={destinations}
          onSave={handleSaveAccount}
          onClose={() => setEditingAccount(null)}
        />
      )}
      {editingDest !== null && (
        <DestModal
          dest={editingDest.id ? editingDest : null}
          onSave={handleSaveDest}
          onClose={() => setEditingDest(null)}
        />
      )}
    </div>
  );
}
