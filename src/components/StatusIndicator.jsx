export default function StatusIndicator({ status }) {
  const base = 'w-2 h-2 rounded-full transition-all duration-300';

  if (status === 'open') {
    return <div className={`${base} bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />;
  }
  if (status === 'launching') {
    return <div className={`${base} bg-amber-500 animate-pulse`} />;
  }
  return <div className={`${base} bg-slate-700`} />;
}
