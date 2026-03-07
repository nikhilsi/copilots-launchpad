import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import GroupSection from '../components/GroupSection';
import ThemeToggle from '../components/ThemeToggle';
import { RocketIcon, GearIcon } from '../components/Icons';

export default function Launcher({ accounts, destinations, onNavigateSettings, onLaunch, theme, onChangeTheme }) {
  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (g) => setCollapsedGroups((prev) => ({ ...prev, [g]: !prev[g] }));

  const filtered = accounts.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const dest = destinations.find((d) => d.id === a.destinationId);
    return (
      a.label.toLowerCase().includes(s) ||
      a.username.toLowerCase().includes(s) ||
      a.group.toLowerCase().includes(s) ||
      (dest && dest.label.toLowerCase().includes(s))
    );
  });

  const groups = {};
  filtered.forEach((a) => {
    if (!groups[a.group]) groups[a.group] = [];
    groups[a.group].push(a);
  });

  const hasAccounts = accounts.length > 0;
  const hasResults = Object.keys(groups).length > 0;

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between py-5 border-b border-black/[0.06] dark:border-white/[0.06] sticky top-0 bg-gray-50 dark:bg-[#0C0F1A] z-50 mb-7 transition-colors">
        <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
          <RocketIcon /> CoPilots Launchpad
        </div>
        <SearchBar value={search} onChange={setSearch} />
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onChangeTheme={onChangeTheme} />
          <button
            className="bg-black/5 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] rounded-[10px] p-2 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200 flex items-center"
            onClick={onNavigateSettings}
          >
            <GearIcon />
          </button>
        </div>
      </div>

      {/* Empty states */}
      {!hasAccounts && (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <p className="text-base mb-2">Welcome! Add your first account in Settings.</p>
          <button
            className="mt-4 px-5 py-2.5 bg-accent/15 text-accent-light border border-accent/30 rounded-lg text-sm font-medium cursor-pointer hover:bg-accent/25"
            onClick={onNavigateSettings}
          >
            Open Settings
          </button>
        </div>
      )}

      {hasAccounts && !hasResults && (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <p className="text-base mb-2">No accounts match your search.</p>
          <p className="text-sm">Try a different term or add accounts in Settings.</p>
        </div>
      )}

      {/* Account groups */}
      {Object.entries(groups).map(([groupName, groupAccounts]) => (
        <GroupSection
          key={groupName}
          groupName={groupName}
          accounts={groupAccounts}
          color={groupAccounts[0].color}
          collapsed={!!collapsedGroups[groupName]}
          onToggle={() => toggleGroup(groupName)}
          destinations={destinations}
          onLaunch={onLaunch}
        />
      ))}
    </div>
  );
}
