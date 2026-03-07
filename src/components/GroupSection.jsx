import { ChevronIcon } from './Icons';
import AccountCard from './AccountCard';

export default function GroupSection({ groupName, accounts, color, collapsed, onToggle, destinations, onLaunch }) {
  const getDestLabel = (destId) => {
    const d = destinations.find((x) => x.id === destId);
    return d ? d.label : 'Unknown';
  };

  return (
    <div className="mb-4">
      <div
        className="flex items-center gap-2 py-2.5 cursor-pointer select-none text-slate-500 dark:text-slate-500"
        onClick={onToggle}
      >
        <ChevronIcon open={!collapsed} />
        <span
          className="text-xs font-semibold uppercase tracking-[0.08em]"
          style={{ color }}
        >
          {groupName}
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-600 font-mono">{accounts.length}</span>
      </div>
      {!collapsed && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-3">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              destLabel={getDestLabel(acc.destinationId)}
              onLaunch={onLaunch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
