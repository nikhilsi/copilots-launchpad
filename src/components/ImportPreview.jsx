import { useState, useMemo } from 'react';
import { BackIcon } from './Icons';

const COLORS = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#EF4444', '#8B5CF6', '#14B8A6'];

/**
 * Parse a CSV string into an array of objects keyed by header names.
 * Handles quoted fields (commas inside quotes) and BOM characters.
 */
function parseCSV(text) {
  // Strip BOM
  const clean = text.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

export default function ImportPreview({ csvText, accounts, destinations, onImport, onClose }) {
  const [defaultDestId, setDefaultDestId] = useState(
    destinations.length === 1 ? destinations[0].id : ''
  );
  const [defaultGroup, setDefaultGroup] = useState('Default');
  const [defaultColor, setDefaultColor] = useState('#6366F1');
  const [checked, setChecked] = useState({});
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const parsed = useMemo(() => parseCSV(csvText), [csvText]);

  // Build rows with status
  const rows = useMemo(() => {
    const existingUsernames = new Set(accounts.map((a) => a.username.toLowerCase()));

    return parsed.map((row, idx) => {
      const label = row.label || '';
      const username = row.username || row.email || '';
      const password = row.password || '';
      const destLabel = row.destination || '';
      const group = row.group || '';
      const color = row.color || '';
      const notes = row.notes || '';

      // Find matching destination by label
      const matchedDest = destLabel
        ? destinations.find((d) => d.label.toLowerCase() === destLabel.toLowerCase())
        : null;

      let status = 'ready';
      let reason = '';

      if (!label) { status = 'invalid'; reason = 'Missing label'; }
      else if (!username) { status = 'invalid'; reason = 'Missing username'; }
      else if (!password) { status = 'invalid'; reason = 'Missing password'; }
      else if (existingUsernames.has(username.toLowerCase())) {
        status = 'exists';
        reason = 'Already exists — delete first to reimport';
      }

      return {
        idx,
        label,
        username,
        password,
        destLabel,
        matchedDestId: matchedDest ? matchedDest.id : null,
        group,
        color,
        notes,
        status,
        reason,
      };
    });
  }, [parsed, accounts, destinations]);

  // Initialize checked state
  useMemo(() => {
    const initial = {};
    rows.forEach((r) => {
      if (!(r.idx in checked)) {
        initial[r.idx] = r.status === 'ready';
      }
    });
    if (Object.keys(initial).length > 0) {
      setChecked((prev) => ({ ...initial, ...prev }));
    }
  }, [rows]);

  const readyCount = rows.filter((r) => r.status === 'ready' && checked[r.idx]).length;
  const existsCount = rows.filter((r) => r.status === 'exists').length;
  const invalidCount = rows.filter((r) => r.status === 'invalid').length;

  const handleImport = async () => {
    if (!defaultDestId) {
      setError('Please select a destination');
      return;
    }
    setError('');
    setImporting(true);

    const toImport = rows
      .filter((r) => r.status === 'ready' && checked[r.idx])
      .map((r) => ({
        label: r.label,
        username: r.username,
        password: r.password,
        destinationId: r.matchedDestId || defaultDestId,
        group: r.group || defaultGroup,
        color: (r.color && /^#[0-9A-Fa-f]{6}$/.test(r.color)) ? r.color : defaultColor,
        notes: r.notes,
      }));

    try {
      const result = await onImport(toImport);
      onClose(result.imported);
    } catch (err) {
      const msg = err.message || '';
      setError(msg.replace(/^Error invoking remote method '[^']+': Error: /, ''));
      setImporting(false);
    }
  };

  const toggleRow = (idx) => {
    const row = rows.find((r) => r.idx === idx);
    if (row.status !== 'ready') return;
    setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAll = () => {
    const allReady = rows.filter((r) => r.status === 'ready');
    const allChecked = allReady.every((r) => checked[r.idx]);
    const next = {};
    allReady.forEach((r) => { next[r.idx] = !allChecked; });
    setChecked((prev) => ({ ...prev, ...next }));
  };

  if (destinations.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between py-5 border-b border-black/[0.06] dark:border-white/[0.06] sticky top-0 bg-gray-50 dark:bg-[#0C0F1A] z-50 mb-7 transition-colors">
          <button className="flex items-center gap-1.5 bg-none border-none text-slate-500 dark:text-slate-400 cursor-pointer text-sm font-medium font-sans p-0 hover:text-slate-700 dark:hover:text-slate-200"
            onClick={() => onClose(0)}>
            <BackIcon /> Back to Settings
          </button>
          <div className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-50">Import Accounts</div>
          <div />
        </div>
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <p className="text-base mb-2">Add at least one destination before importing accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between py-5 border-b border-black/[0.06] dark:border-white/[0.06] sticky top-0 bg-gray-50 dark:bg-[#0C0F1A] z-50 mb-7 transition-colors">
        <button className="flex items-center gap-1.5 bg-none border-none text-slate-500 dark:text-slate-400 cursor-pointer text-sm font-medium font-sans p-0 hover:text-slate-700 dark:hover:text-slate-200"
          onClick={() => onClose(0)}>
          <BackIcon /> Back to Settings
        </button>
        <div className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-50">Import Accounts</div>
        <div />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Defaults bar */}
      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-3">
          Defaults for imported accounts
        </div>
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-slate-600 mb-1.5 block">Destination</label>
            <select
              className="w-full py-2 px-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-800 dark:text-slate-200 text-sm font-sans outline-none"
              value={defaultDestId}
              onChange={(e) => setDefaultDestId(e.target.value)}
            >
              <option value="">Select destination...</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-slate-600 mb-1.5 block">Group</label>
            <input
              className="w-full py-2 px-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-800 dark:text-slate-200 text-sm font-sans outline-none"
              value={defaultGroup}
              onChange={(e) => setDefaultGroup(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-slate-600 mb-1.5 block">Color</label>
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setDefaultColor(c)} type="button"
                  className="w-6 h-6 rounded-md border-none cursor-pointer transition-all"
                  style={{
                    background: c,
                    outline: defaultColor === c ? '2px solid currentColor' : '2px solid transparent',
                    outlineOffset: 2,
                  }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview table */}
      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-slate-500 dark:text-slate-600">
            {rows.length} accounts found
            {existsCount > 0 && <span className="text-amber-500 ml-2">({existsCount} already exist)</span>}
            {invalidCount > 0 && <span className="text-red-500 ml-2">({invalidCount} invalid)</span>}
          </span>
        </div>

        <div className="grid grid-cols-[auto_1fr_1.5fr_auto] gap-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-600 border-b border-black/[0.06] dark:border-white/[0.06]">
          <span>
            <input type="checkbox" checked={rows.filter((r) => r.status === 'ready').every((r) => checked[r.idx])}
              onChange={toggleAll} className="cursor-pointer" />
          </span>
          <span>Label</span>
          <span>Username</span>
          <span>Status</span>
        </div>

        {rows.map((row) => (
          <div key={row.idx}>
            <div className={`grid grid-cols-[auto_1fr_1.5fr_auto] gap-3 items-center px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.04] text-sm transition-colors ${
              row.status !== 'ready' ? 'opacity-50' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
            }`}>
              <span>
                <input type="checkbox" checked={!!checked[row.idx]} disabled={row.status !== 'ready'}
                  onChange={() => toggleRow(row.idx)} className="cursor-pointer" />
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{row.label || '—'}</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-xs truncate">{row.username || '—'}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                row.status === 'ready' ? 'text-emerald-600 bg-emerald-500/10' :
                row.status === 'exists' ? 'text-amber-600 bg-amber-500/10' :
                'text-red-500 bg-red-500/10'
              }`}>
                {row.status === 'ready' ? 'Ready' : row.status === 'exists' ? 'Exists' : 'Invalid'}
              </span>
            </div>
            {row.reason && (
              <div className="px-4 pb-2 pl-12 text-xs text-slate-400 dark:text-slate-600">
                {row.reason}
              </div>
            )}
          </div>
        ))}

        {rows.length === 0 && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
            No valid rows found in the CSV file.
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <button className="px-6 py-2.5 bg-transparent text-slate-500 dark:text-slate-400 border border-black/10 dark:border-white/10 rounded-lg text-sm font-medium font-sans cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => onClose(0)}>Cancel</button>
          <button
            className="px-6 py-2.5 bg-accent text-white border-none rounded-lg text-sm font-semibold font-sans cursor-pointer hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={readyCount === 0 || !defaultDestId || importing}
            onClick={handleImport}
          >
            {importing ? 'Importing...' : `Import ${readyCount} account${readyCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
