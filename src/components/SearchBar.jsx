import { SearchIcon } from './Icons';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-[0_1_340px]">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600">
        <SearchIcon />
      </span>
      <input
        className="w-full py-2.5 pl-9 pr-3 bg-black/5 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] rounded-[10px] text-slate-800 dark:text-slate-200 text-sm font-sans outline-none transition-colors focus:border-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] placeholder:text-slate-400 dark:placeholder:text-slate-600"
        placeholder="Search accounts, groups, destinations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
