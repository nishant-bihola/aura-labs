'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { CATEGORIES, CATEGORY_KEYS, Category, Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  editTransaction?: Transaction;
}

const EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  amount: '',
  category: 'others' as Category,
  description: '',
};

export default function TransactionModal({ open, onClose, editTransaction }: Props) {
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editTransaction) {
      setForm({
        date: editTransaction.date,
        amount: editTransaction.amount.toString(),
        category: editTransaction.category,
        description: editTransaction.description,
      });
    } else {
      setForm({ ...EMPTY, date: format(new Date(), 'yyyy-MM-dd') });
    }
  }, [editTransaction, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, amount: parseFloat(form.amount) };
    if (editTransaction) {
      updateTransaction(editTransaction.id, data);
    } else {
      addTransaction(data);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="font-semibold text-white text-lg">
            {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input pl-7"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="label">Date</label>
              <input
                required
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_KEYS.map((cat) => {
                const { label, color, icon } = CATEGORIES[cat];
                const active = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: cat }))}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all"
                    style={
                      active
                        ? { borderColor: color, backgroundColor: color + '22', color }
                        : { borderColor: '#334155', color: '#94a3b8' }
                    }
                  >
                    <span>{icon}</span>
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <input
              type="text"
              className="input"
              placeholder="What was this for? (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 border border-slate-700">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editTransaction ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
