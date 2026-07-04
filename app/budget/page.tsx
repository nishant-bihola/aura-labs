'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { CATEGORIES, CATEGORY_KEYS, Category } from '@/lib/types';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export default function BudgetPage() {
  const payAmount = useStore((s) => s.payAmount);
  const budget = useStore((s) => s.budget);
  const firstPayDate = useStore((s) => s.firstPayDate);
  const transactions = useStore((s) => s.transactions);
  const setPayAmount = useStore((s) => s.setPayAmount);
  const setBudget = useStore((s) => s.setBudget);
  const setFirstPayDate = useStore((s) => s.setFirstPayDate);

  const [localPay, setLocalPay] = useState('');
  const [localDate, setLocalDate] = useState('');
  const [localBudget, setLocalBudget] = useState<Record<Category, string>>({
    phone_bills: '',
    car_gas: '',
    car_insurance: '',
    investments: '',
    loan_repayments: '',
    others: '',
  });
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocalPay(payAmount > 0 ? payAmount.toString() : '');
    setLocalDate(firstPayDate);
    setLocalBudget(
      Object.fromEntries(
        CATEGORY_KEYS.map((c) => [c, budget[c] > 0 ? budget[c].toString() : ''])
      ) as Record<Category, string>
    );
    setHydrated(true);
  }, [payAmount, budget, firstPayDate]);

  const income = parseFloat(localPay) || 0;
  const totalAllocated = CATEGORY_KEYS.reduce(
    (a, c) => a + (parseFloat(localBudget[c]) || 0),
    0
  );
  const unallocated = income - totalAllocated;
  const dateChanged = localDate !== firstPayDate && transactions.length > 0;

  const handleSave = () => {
    setPayAmount(parseFloat(localPay) || 0);
    setFirstPayDate(localDate); // also re-assigns all transactions
    CATEGORY_KEYS.forEach((cat) => {
      setBudget(cat, parseFloat(localBudget[cat]) || 0);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Budget Setup</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Configure your biweekly income and spending limits
        </p>
      </div>

      {/* Paycheck Settings */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2 text-base">
          <span className="text-xl">💰</span> Paycheck Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Biweekly Net Income</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input pl-7"
                placeholder="e.g. 2400.00"
                value={localPay}
                onChange={(e) => setLocalPay(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">First Pay Date</label>
            <input
              type="date"
              className="input"
              value={localDate}
              onChange={(e) => setLocalDate(e.target.value)}
            />
          </div>
        </div>

        {/* Pay date change warning */}
        {dateChanged && (
          <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded-xl p-3">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
            <span>
              Changing the first pay date will re-assign all{' '}
              <strong>{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</strong>{' '}
              to the new biweekly schedule.
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-800/40 rounded-xl p-3">
          <Info size={13} className="flex-shrink-0 mt-0.5" />
          <span>
            Enter your after-tax take-home pay. The first pay date anchors all biweekly
            periods — transactions are automatically assigned to the correct period.
          </span>
        </div>
      </div>

      {/* Income allocation bar */}
      {income > 0 && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-white text-base">Income Allocation</h2>
            <span
              className={clsx(
                'text-sm font-bold',
                unallocated >= 0 ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {unallocated >= 0
                ? `$${unallocated.toFixed(0)} unallocated`
                : `$${Math.abs(unallocated).toFixed(0)} over-allocated`}
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
            {CATEGORY_KEYS.map((cat) => {
              const pct = ((parseFloat(localBudget[cat]) || 0) / income) * 100;
              return pct > 0 ? (
                <div
                  key={cat}
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: CATEGORIES[cat].color,
                  }}
                  title={`${CATEGORIES[cat].label}: ${pct.toFixed(1)}%`}
                />
              ) : null;
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {CATEGORY_KEYS.map((cat) => {
              const pct = ((parseFloat(localBudget[cat]) || 0) / income) * 100;
              if (pct === 0) return null;
              return (
                <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORIES[cat].color }}
                  />
                  {CATEGORIES[cat].label} {pct.toFixed(0)}%
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-category limits */}
      <div className="card p-5 space-y-5">
        <div>
          <h2 className="font-semibold text-white text-base">Per-Category Limits</h2>
          <p className="text-xs text-slate-500 mt-1">
            Amount you plan to spend each pay period
          </p>
        </div>

        {CATEGORY_KEYS.map((cat) => {
          const { label, color, icon } = CATEGORIES[cat];
          const val = parseFloat(localBudget[cat]) || 0;
          const pct = income > 0 ? (val / income) * 100 : 0;

          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-2 gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <span className="text-sm font-semibold text-slate-200 truncate">{label}</span>
                  {income > 0 && val > 0 && (
                    <span className="text-xs text-slate-500 flex-shrink-0">
                      {pct.toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="relative w-32 flex-shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="input pl-7 pr-2 text-right tabular-nums"
                    placeholder="0"
                    value={localBudget[cat]}
                    onChange={(e) =>
                      setLocalBudget((b) => ({ ...b, [cat]: e.target.value }))
                    }
                  />
                </div>
              </div>
              {income > 0 && (
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        className={clsx(
          'w-full py-3 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2',
          saved
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : 'btn-primary'
        )}
      >
        {saved ? (
          <>
            <CheckCircle2 size={18} /> Saved!
          </>
        ) : (
          'Save Budget Settings'
        )}
      </button>
    </div>
  );
}
