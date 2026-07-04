'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useCategories } from '@/lib/categories';
import { suggestCategory } from '@/lib/suggest';
import { Transaction, TxType } from '@/lib/types';
import { format } from 'date-fns';
import { X, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  open: boolean;
  onClose: () => void;
  editTransaction?: Transaction;
}

const EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  amount: '',
  category: 'others',
  description: '',
  type: 'expense' as TxType,
};

export default function TransactionModal({ open, onClose, editTransaction }: Props) {
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const transactions = useStore((s) => s.transactions);
  const { categories } = useCategories();
  const [form, setForm] = useState({ ...EMPTY });
  const [suggested, setSuggested] = useState(false);
  // true once the user picks a category by hand — stops auto-suggestion overriding them
  const categoryTouched = useRef(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (editTransaction) {
      setForm({
        date: editTransaction.date,
        amount: editTransaction.amount.toString(),
        category: editTransaction.category,
        description: editTransaction.description,
        type: editTransaction.type ?? 'expense',
      });
      categoryTouched.current = true;
    } else {
      setForm({ ...EMPTY, date: format(new Date(), 'yyyy-MM-dd') });
      categoryTouched.current = false;
    }
    setSuggested(false);
  }, [editTransaction, open]);

  const handleDescriptionChange = (value: string) => {
    setForm((f) => ({ ...f, description: value }));
    // Learn from history: auto-pick a category unless the user chose one themselves
    if (!categoryTouched.current && form.type === 'expense' && value.length >= 3) {
      const match = suggestCategory(value, transactions);
      if (match) {
        setForm((f) => ({ ...f, description: value, category: match }));
        setSuggested(true);
      }
    }
  };

  const pickCategory = (id: string) => {
    categoryTouched.current = true;
    setSuggested(false);
    setForm((f) => ({ ...f, category: id }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;
    const payload = { ...form, amount };
    if (editTransaction) {
      updateTransaction(editTransaction.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-700 sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[95dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="font-semibold text-white text-lg">
            {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Expense / Income toggle */}
          <div className="grid grid-cols-2 gap-1 bg-slate-800 rounded-xl p-1">
            {(['expense', 'income'] as TxType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={clsx(
                  'py-2 rounded-lg text-sm font-semibold transition-all',
                  form.type === t
                    ? t === 'expense'
                      ? 'bg-rose-600/90 text-white'
                      : 'bg-emerald-600/90 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {t === 'expense' ? '💸 Expense' : '💰 Income'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
                  $
                </span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input pl-7"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  autoFocus={!editTransaction}
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
            <label className="label">
              Description{' '}
              <span className="text-slate-600 font-normal">
                {form.type === 'expense' ? '(auto-categorizes)' : '(optional)'}
              </span>
            </label>
            <input
              type="text"
              className="input"
              placeholder={form.type === 'expense' ? 'e.g. Shell gas station' : 'e.g. Side gig payment'}
              value={form.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
          </div>

          {form.type === 'expense' && (
            <div>
              <label className="label flex items-center gap-2">
                Category
                {suggested && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    <Sparkles size={10} /> suggested from your history
                  </span>
                )}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-0.5">
                {categories.map((cat) => {
                  const active = form.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => pickCategory(cat.id)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left"
                      style={
                        active
                          ? { borderColor: cat.color, backgroundColor: cat.color + '22', color: cat.color }
                          : { borderColor: '#334155', color: '#94a3b8' }
                      }
                    >
                      <span className="flex-shrink-0">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={clsx(
                'flex-1 font-semibold px-4 py-2 rounded-xl transition-all active:scale-95 text-white',
                form.type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700'
              )}
            >
              {editTransaction ? 'Update' : form.type === 'income' ? 'Add Income' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
