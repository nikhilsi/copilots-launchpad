import { useState } from 'react';

export default function App() {
  const [view, setView] = useState('launcher');

  return (
    <div className="min-h-screen bg-surface max-w-[960px] mx-auto px-6 pb-12">
      <div className="flex items-center justify-between py-5 border-b border-border sticky top-0 bg-surface z-50 mb-7">
        <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-50">
          CoPilots Launchpad
        </div>
        <div className="text-sm text-slate-500">
          Shell ready — UI coming in Phase 2
        </div>
      </div>
      <div className="text-center py-16 text-slate-500">
        <p className="text-base mb-2">Electron shell is running.</p>
        <p className="text-sm">IPC bridge and credential store are wired up.</p>
        <p className="text-sm mt-1">The full UI will be built in Phase 2.</p>
      </div>
    </div>
  );
}
