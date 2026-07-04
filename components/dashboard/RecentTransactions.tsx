'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useCategories } from '@/lib/categories';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Plus } from 'lucide-react';
import TransactionModal from '@/components/transactions/TransactionModal';

export default function RecentTransactions() {
  const transactions = useStore((s) => s.transactions);
  const [modalOpen, setModalOpen] = useState(false);
  const { categoryMap } = useCategories();

  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Recent Transactions</h2>
          <p className="text-xs text-slate-500 mt-0.5">{transactions.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary flex items-center gap-1.5 text-sm py-1.5 px-3"
          >
            <Plus size={14} /> Add
          </button>
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="card-body flex flex-col items-center justify-center py-12 gap-3 text-center">
          <p className="text-slate-500 text-sm">No transactions yet.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Add first transaction
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {recent.map((t) => {
            const cat = categoryMap[t.category] ?? { label: t.category, color: '#64748b', icon: '📦' };
            return (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{t.description || cat.label}</p>
                  <p className="text-xs text-slate-500">{format(parseISO(t.date), 'MMM d, yyyy')} · {cat.label}</p>
                </div>
                <span className="text-sm font-bold text-rose-400 flex-shrink-0 tabular-nums">
                  −${t.amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
