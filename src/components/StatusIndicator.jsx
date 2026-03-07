export default function StatusIndicator({ status }) {
  const base = 'w-2 h-2 rounded-full transition-all duration-300';

  if (status === 'open') {
    return <div className={`${base} bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]`} title="Browser open" />;
  }
  if (status === 'launching') {
    return <div className={`${base} bg-amber-500 animate-pulse`} title="Launching..." />;
  }
  if (status === 'error') {
    return <div className={`${base} bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]`} title="Launch failed" />;
  }
  return <div className={`${base} bg-slate-300 dark:bg-slate-700`} title="Idle" />;
}
