import { useState } from 'react';

const inputClass = "w-full py-2.5 px-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-800 dark:text-slate-200 text-sm font-sans outline-none focus:border-accent/50 placeholder:text-slate-400 dark:placeholder:text-slate-500";

export default function DestModal({ dest, onSave, onClose }) {
  const isEdit = !!dest;
  const [form, setForm] = useState({
    label: '',
    url: '',
    ...dest,
  });

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!form.label || !form.url) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={onClose}>
      <div className="bg-white dark:bg-[#151929] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-7 w-full max-w-[420px] shadow-xl dark:shadow-none" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-5">
          {isEdit ? 'Edit Destination' : 'Add Destination'}
        </h3>

        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-1.5 block">Label</label>
          <input className={inputClass} value={form.label} placeholder="e.g. Copilot Chat"
            onChange={(e) => set('label', e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-1.5 block">URL</label>
          <input className={inputClass} value={form.url} placeholder="https://m365.cloud.microsoft/chat"
            onChange={(e) => set('url', e.target.value)} />
        </div>

        <div className="flex justify-end gap-2.5 mt-2">
          <button className="px-6 py-2.5 bg-transparent text-slate-500 dark:text-slate-400 border border-black/10 dark:border-white/10 rounded-lg text-sm font-medium font-sans cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            onClick={onClose}>Cancel</button>
          <button className="px-6 py-2.5 bg-accent text-white border-none rounded-lg text-sm font-semibold font-sans cursor-pointer hover:bg-accent-light"
            onClick={handleSave}>{isEdit ? 'Save Changes' : 'Add Destination'}</button>
        </div>
      </div>
    </div>
  );
}
