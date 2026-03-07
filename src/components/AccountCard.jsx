import StatusIndicator from './StatusIndicator';
import { LinkIcon } from './Icons';

export default function AccountCard({ account, destLabel, onLaunch }) {
  const isLaunching = account.status === 'launching';

  return (
    <div
      className={`
        bg-white dark:bg-white/[0.03] border rounded-xl px-4 pt-4 pb-3.5 cursor-pointer
        transition-all duration-[250ms] relative overflow-hidden
        hover:bg-gray-50 dark:hover:bg-white/[0.06] hover:-translate-y-0.5
        shadow-sm dark:shadow-none
        ${isLaunching ? 'animate-[pulse-launch_1.5s_infinite]' : ''}
      `}
      style={{
        borderColor: isLaunching ? account.color : undefined,
        borderLeftWidth: 3,
        borderLeftColor: account.color,
      }}
      onClick={() => onLaunch(account.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${account.color}60`;
        e.currentTarget.style.boxShadow = `0 4px 20px ${account.color}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isLaunching ? account.color : '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{account.label}</span>
        <StatusIndicator status={account.status} />
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-600 font-mono mb-2.5 truncate">
        {account.username}
      </div>
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md"
          style={{
            color: account.color,
            background: `${account.color}15`,
          }}
        >
          <LinkIcon /> {destLabel}
        </span>
        {account.notes && (
          <span className="text-[11px] text-slate-400 dark:text-slate-600 italic truncate ml-2">
            {account.notes}
          </span>
        )}
      </div>
    </div>
  );
}
