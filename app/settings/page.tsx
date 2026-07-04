'use client';

import { useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { Download, Upload, Trash2, Database, ShieldCheck, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const transactions = useStore((s) => s.transactions);
  const customCategories = useStore((s) => s.customCategories);
  const bills = useStore((s) => s.bills);
  const goals = useStore((s) => s.goals);
  const clearAll = useStore((s) => s.clearAll);

  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const flash = (text: string, ok = true) => {
    setMessage({ text, ok });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExport = () => {
    const s = useStore.getState();
    const backup = {
      app: 'paytrack',
      exportedAt: new Date().toISOString(),
      data: {
        payAmount: s.payAmount,
        firstPayDate: s.firstPayDate,
        payPeriods: s.payPeriods,
        budget: s.budget,
        transactions: s.transactions,
        customCategories: s.customCategories,
        bills: s.bills,
        goals: s.goals,
      },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paytrack-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash('Backup downloaded ✓');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const d = parsed?.data;
        if (!d || !Array.isArray(d.transactions) || !Array.isArray(d.payPeriods)) {
          flash('Not a valid PayTrack backup file', false);
          return;
        }
        if (!window.confirm('Restore this backup? Your current data will be replaced.')) return;
        useStore.setState({
          payAmount: d.payAmount ?? 0,
          firstPayDate: d.firstPayDate ?? format(new Date(), 'yyyy-MM-dd'),
          payPeriods: d.payPeriods,
          budget: d.budget ?? {},
          transactions: d.transactions.map((t: Record<string, unknown>) => ({ ...t, type: t.type ?? 'expense' })),
          customCategories: Array.isArray(d.customCategories) ? d.customCategories : [],
          bills: Array.isArray(d.bills) ? d.bills : [],
          goals: Array.isArray(d.goals) ? d.goals : [],
        });
        flash(`Restored ${d.transactions.length} transactions ✓`);
      } catch {
        flash('Could not read that file', false);
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (!window.confirm('Delete ALL data? This cannot be undone. Consider exporting a backup first.')) return;
    if (!window.confirm('Are you absolutely sure? Every transaction, bill, and goal will be erased.')) return;
    clearAll();
    flash('All data cleared');
  };

  const storageKB =
    typeof window !== 'undefined'
      ? ((localStorage.getItem('budget-store-v2')?.length ?? 0) / 1024).toFixed(1)
      : '0';

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Backups, data, and app info</p>
      </div>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.ok
              ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-800/40 text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Backup & Restore */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-white text-base flex items-center gap-2">
          <Database size={16} className="text-indigo-400" /> Backup &amp; Restore
        </h2>
        <p className="text-xs text-slate-500">
          Your data lives only in this browser. Export a backup file to keep it safe or move it to another device.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={handleExport} className="btn-primary flex items-center justify-center gap-2 text-sm">
            <Download size={15} /> Export backup (JSON)
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-ghost border border-slate-700 flex items-center justify-center gap-2 text-sm"
          >
            <Upload size={15} /> Restore from backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* Data stats */}
      <div className="card p-5">
        <h2 className="font-semibold text-white text-base flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-emerald-400" /> Your Data
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Transactions', value: transactions.length },
            { label: 'Custom Categories', value: customCategories.length },
            { label: 'Recurring Bills', value: bills.length },
            { label: 'Savings Goals', value: goals.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-white tabular-nums">{value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          {storageKB} KB stored locally · nothing ever leaves your device
        </p>
      </div>

      {/* Install hint */}
      <div className="card p-5 flex items-start gap-3">
        <Smartphone size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-white">Install as an app</p>
          <p className="text-xs text-slate-400 mt-1">
            On iPhone: Share → &quot;Add to Home Screen&quot;. On Android: browser menu → &quot;Install app&quot;.
            PayTrack works offline once installed.
          </p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-5 border-rose-900/40">
        <h2 className="font-semibold text-rose-400 text-base mb-2">Danger Zone</h2>
        <p className="text-xs text-slate-500 mb-4">
          Wipes every transaction, bill, goal, and budget setting. Custom categories are kept.
        </p>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 text-sm font-semibold text-rose-400 border border-rose-900/60 hover:bg-rose-950/40 px-4 py-2 rounded-xl transition-colors"
        >
          <Trash2 size={14} /> Clear all data
        </button>
      </div>
    </div>
  );
}
