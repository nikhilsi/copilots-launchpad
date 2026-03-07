import { useState } from 'react';
import { BackIcon, PlusIcon, EditIcon, TrashIcon, UploadIcon, DownloadIcon } from '../components/Icons';
import ThemeToggle from '../components/ThemeToggle';
import AccountModal from '../components/AccountModal';
import DestModal from '../components/DestModal';
import ImportPreview from '../components/ImportPreview';

export default function Settings({
  accounts, destinations,
  onAddAccount, onUpdateAccount, onDeleteAccount,
  onImportAccounts, onExportAccounts,
  onAddDestination, onUpdateDestination, onDeleteDestination,
  onBack, theme, onChangeTheme,
  browserChannel, onChangeBrowserChannel,
}) {
  const [tab, setTab] = useState('accounts');
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingDest, setEditingDest] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [importCSV, setImportCSV] = useState(null);
  const [exportIncludePasswords, setExportIncludePasswords] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const switchTab = (t) => { setError(''); setSuccessMsg(''); setTab(t); };

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
    if (!confirm('Delete this account? The associated browser profile will also be removed.')) return;
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
      const msg = err.message || '';
      const clean = msg.replace(/^Error invoking remote method '[^']+': Error: /, '');
      setError(clean || 'Cannot delete — destination is assigned to accounts.');
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImportCSV(ev.target.result);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleImportClose = (importedCount) => {
    setImportCSV(null);
    if (importedCount > 0) {
      setSuccessMsg(`Imported ${importedCount} account${importedCount !== 1 ? 's' : ''} successfully`);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handleExport = async () => {
    try {
      const data = await onExportAccounts({ includePasswords: exportIncludePasswords });
      if (data.length === 0) {
        setError('No accounts to export');
        setShowExportModal(false);
        return;
      }
      const headers = ['label', 'username', 'password', 'destination', 'group', 'color', 'notes'];
      const csvRows = [headers.join(',')];
      for (const row of data) {
        const values = headers.map((h) => {
          const val = (row[h] || '').toString();
          // Quote fields that contain commas or quotes
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });
        csvRows.push(values.join(','));
      }
      const csv = csvRows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'copilots-launchpad-accounts.csv';
      a.click();
      URL.revokeObjectURL(url);
      setShowExportModal(false);
      setExportIncludePasswords(false);
    } catch (err) {
      const msg = err.message || '';
      setError(msg.replace(/^Error invoking remote method '[^']+': Error: /, '') || 'Export failed');
      setShowExportModal(false);
    }
  };

  // Show import preview if CSV is loaded
  if (importCSV) {
    return (
      <ImportPreview
        csvText={importCSV}
        accounts={accounts}
        destinations={destinations}
        onImport={onImportAccounts}
        onClose={handleImportClose}
      />
    );
  }

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

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400 text-sm">
          {successMsg}
        </div>
      )}

      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-6 shadow-sm dark:shadow-none">
        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-black/[0.03] dark:bg-white/[0.03] rounded-[10px] p-1">
          <button className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer border-none font-sans transition-colors ${tab === 'accounts' ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-none' : 'bg-transparent text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'}`}
            onClick={() => switchTab('accounts')}>Accounts</button>
          <button className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer border-none font-sans transition-colors ${tab === 'destinations' ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-none' : 'bg-transparent text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'}`}
            onClick={() => switchTab('destinations')}>Destinations</button>
          <button className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer border-none font-sans transition-colors ${tab === 'general' ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-none' : 'bg-transparent text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'}`}
            onClick={() => switchTab('general')}>General</button>
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
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-black/[0.08] dark:border-white/[0.08] rounded-lg text-sm font-medium cursor-pointer font-sans hover:bg-black/10 dark:hover:bg-white/10"
                  onClick={handleImportClick}>
                  <UploadIcon /> Import
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-black/[0.08] dark:border-white/[0.08] rounded-lg text-sm font-medium cursor-pointer font-sans hover:bg-black/10 dark:hover:bg-white/10"
                  onClick={() => setShowExportModal(true)}
                  disabled={accounts.length === 0}>
                  <DownloadIcon /> Export
                </button>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent/15 text-accent-light border border-accent/30 rounded-lg text-sm font-medium cursor-pointer font-sans hover:bg-accent/25"
                  onClick={() => setEditingAccount({})}>
                  <PlusIcon /> Add Account
                </button>
              </div>
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
              <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">No accounts yet. Click "Add Account" or "Import" to get started.</div>
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
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]"
          onClick={() => setShowExportModal(false)} onKeyDown={(e) => { if (e.key === 'Escape') setShowExportModal(false); }}>
          <div role="dialog" aria-modal="true" aria-label="Export Accounts"
            className="bg-white dark:bg-[#151929] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-7 w-full max-w-[420px] shadow-xl dark:shadow-none" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Export Accounts</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Export {accounts.length} account{accounts.length !== 1 ? 's' : ''} to a CSV file.
            </p>
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={exportIncludePasswords}
                onChange={(e) => setExportIncludePasswords(e.target.checked)} />
              <span className="text-sm text-slate-700 dark:text-slate-300">Include passwords</span>
            </label>
            {exportIncludePasswords && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 dark:text-amber-400 text-xs">
                Passwords will be exported in plaintext. Handle the file with care.
              </div>
            )}
            <div className="flex justify-end gap-2.5">
              <button className="px-6 py-2.5 bg-transparent text-slate-500 dark:text-slate-400 border border-black/10 dark:border-white/10 rounded-lg text-sm font-medium font-sans cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => { setShowExportModal(false); setExportIncludePasswords(false); }}>Cancel</button>
              <button className="px-6 py-2.5 bg-accent text-white border-none rounded-lg text-sm font-semibold font-sans cursor-pointer hover:bg-accent-light"
                onClick={handleExport}>Export CSV</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
