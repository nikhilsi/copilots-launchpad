import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons';

const COLORS = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#EF4444', '#8B5CF6', '#14B8A6'];

const inputClass = "w-full py-2.5 px-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-800 dark:text-slate-200 text-sm font-sans outline-none focus:border-accent/50 placeholder:text-slate-400 dark:placeholder:text-slate-500";

export default function AccountModal({ account, destinations, onSave, onClose }) {
  const isEdit = !!account;
  const [form, setForm] = useState({
    label: '',
    username: '',
    password: '',
    group: '',
    color: '#6366F1',
    destinationId: destinations[0]?.id || '',
    notes: '',
    ...account,
  });
  const [showPw, setShowPw] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!form.label || !form.username || !form.group || !form.destinationId) return;
    if (!isEdit && !form.password) return;
    onSave(form);
    // Clear password from component state immediately after submitting
    setForm((prev) => ({ ...prev, password: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]"
      onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Account' : 'Add Account'}
        className="bg-white dark:bg-[#151929] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-7 w-full max-w-[480px] shadow-xl dark:shadow-none" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-5">
          {isEdit ? 'Edit Account' : 'Add Account'}
        </h3>

        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-1.5 block">Friendly Label</label>
          <input className={inputClass} value={form.label} placeholder="e.g. Global Admin"
            onChange={(e) => set('label', e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-1.5 block">Username / Email</label>
          <input className={inputClass} value={form.username} placeholder="user@contoso.onmicrosoft.com"
            onChange={(e) => set('username', e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-1.5 block">
            Password {isEdit && <span className="normal-case font-normal">(leave blank to keep current)</span>}
          </label>
          <div className="relative">
            <input className={`${inputClass} pr-9`}
              type={showPw ? 'text' : 'password'} value={form.password}
              placeholder={isEdit ? '••••••••' : ''}
              onChange={(e) => set('password', e.target.value)} />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
              onClick={() => setShowPw(!showPw)} type="button">
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-1.5 block">Group</label>
            <input className={inputClass} value={form.group} placeholder="e.g. Admins"
              onChange={(e) => set('group', e.target.value)} />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-1.5 block">Destination</label>
            <select className={inputClass} value={form.destinationId}
              onChange={(e) => set('destinationId', e.target.value)}>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-1.5 block">Color</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button key={c} onClick={() => set('color', c)} type="button"
                className="w-7 h-7 rounded-lg border-none cursor-pointer transition-all"
                style={{
                  background: c,
                  outline: form.color === c ? '2px solid currentColor' : '2px solid transparent',
                  outlineOffset: 2,
                }} />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-600 mb-1.5 block">Notes (optional)</label>
          <input className={inputClass} value={form.notes} placeholder="Any extra context..."
            onChange={(e) => set('notes', e.target.value)} />
        </div>

        <div className="flex justify-end gap-2.5 mt-2">
          <button className="px-6 py-2.5 bg-transparent text-slate-500 dark:text-slate-400 border border-black/10 dark:border-white/10 rounded-lg text-sm font-medium font-sans cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            onClick={onClose}>Cancel</button>
          <button className="px-6 py-2.5 bg-accent text-white border-none rounded-lg text-sm font-semibold font-sans cursor-pointer hover:bg-accent-light"
            onClick={handleSave}>{isEdit ? 'Save Changes' : 'Add Account'}</button>
        </div>
      </div>
    </div>
  );
}
