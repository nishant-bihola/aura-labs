'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { CATEGORIES, CATEGORY_KEYS, Category, Transaction } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Plus, Trash2, Pencil, Search, Download } from 'lucide-react';
import TransactionModal from '@/components/transactions/TransactionModal';

export default function TransactionsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('current');
  const [exporting, setExporting] = useState(false);

  const transactions = useStore((s) => s.transactions);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const payPeriods = useStore((s) => s.payPeriods);
  const getCurrentPeriod = useStore((s) => s.getCurrentPeriod);
  const currentPeriod = getCurrentPeriod();

  const periodsWithTx = payPeriods.filter((p) =>
    transactions.some((t) => t.payPeriodId === p.id)
  );

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || t.description.toLowerCase().includes(q) || CATEGORIES[t.category].label.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || t.category === catFilter;
    const matchPeriod =
      periodFilter === 'all' ||
      (periodFilter === 'current' && t.payPeriodId === currentPeriod?.id) ||
      t.payPeriodId === periodFilter;
    return matchSearch && matchCat && matchPeriod;
  });

  const totalFiltered = filtered.reduce((a, t) => a + t.amount, 0);

  const openAdd = () => { setEditTx(undefined); setModalOpen(true); };
  const openEdit = (tx: Transaction) => { setEditTx(tx); setModalOpen(true); };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: filtered }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {filtered.length} shown &middot; ${totalFiltered.toFixed(2)} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {filtered.length > 0 && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-ghost flex items-center gap-2 text-sm border border-slate-700 disabled:opacity-50"
            >
              <Download size={15} />
              {exporting ? 'Exporting…' : 'CSV'}
            </button>
          )}
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Search by description or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input sm:w-52"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
          >
            <option value="current">Current Period</option>
            <option value="all">All Periods</option>
            {periodsWithTx.map((p) => (
              <option key={p.id} value={p.id}>
                {format(parseISO(p.startDate), 'MMM d')} – {format(parseISO(p.endDate), 'MMM d')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCatFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              catFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          {CATEGORY_KEYS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={
                catFilter === cat
                  ? { backgroundColor: CATEGORIES[cat].color, color: '#fff' }
                  : { backgroundColor: '#1e293b', color: '#94a3b8' }
              }
            >
              {CATEGORIES[cat].icon} {CATEGORIES[cat].label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500">
                    {transactions.length === 0
                      ? 'No transactions yet — add your first one above.'
                      : 'No results for current filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const cat = CATEGORIES[t.category];
                  return (
                    <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{cat.icon}</span>
                          <span className="font-medium text-slate-200">{t.description || cat.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: cat.color + '25', color: cat.color }}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{format(parseISO(t.date), 'MMM d, yyyy')}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-rose-400 tabular-nums">
                        −${t.amount.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(t)} className="text-slate-500 hover:text-slate-200 transition-colors p-1" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteTransaction(t.id)} className="text-slate-500 hover:text-rose-400 transition-colors p-1" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} editTransaction={editTx} />
    </div>
  );
}
