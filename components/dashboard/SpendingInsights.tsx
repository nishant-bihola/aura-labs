'use client';

import { useStore } from '@/lib/store';
import { useCategories } from '@/lib/categories';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SpendingInsights() {
  const payPeriods = useStore((s) => s.payPeriods);
  const getCurrentPeriod = useStore((s) => s.getCurrentPeriod);
  const getCategorySpend = useStore((s) => s.getCategorySpend);
  const transactions = useStore((s) => s.transactions);
  const { categories } = useCategories();

  const currentPeriod = getCurrentPeriod();
  if (!currentPeriod) return null;

  // Find the previous period (the one immediately before current)
  const sorted = [...payPeriods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const currentIdx = sorted.findIndex((p) => p.id === currentPeriod.id);
  const prevPeriod = currentIdx > 0 ? sorted[currentIdx - 1] : null;

  if (!prevPeriod) return null;

  const prevHasTx = transactions.some((t) => t.payPeriodId === prevPeriod.id);
  const currHasTx = transactions.some((t) => t.payPeriodId === currentPeriod.id);
  if (!prevHasTx && !currHasTx) return null;

  const currSpend = getCategorySpend(currentPeriod.id);
  const prevSpend = getCategorySpend(prevPeriod.id);

  const currTotal = Object.values(currSpend).reduce((a, b) => a + b, 0);
  const prevTotal = Object.values(prevSpend).reduce((a, b) => a + b, 0);
  const totalDiff = currTotal - prevTotal;
  const totalPct = prevTotal > 0 ? (totalDiff / prevTotal) * 100 : 0;

  // Per-category changes, only show categories with activity
  const insights = categories
    .map((cat) => {
      const curr = currSpend[cat.id] ?? 0;
      const prev = prevSpend[cat.id] ?? 0;
      const diff = curr - prev;
      const pct = prev > 0 ? (diff / prev) * 100 : curr > 0 ? 100 : 0;
      return { cat, curr, prev, diff, pct };
    })
    .filter((i) => i.curr > 0 || i.prev > 0)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 4);

  if (insights.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-semibold text-white">Spending Insights</h2>
          <p className="text-xs text-slate-500 mt-0.5">vs previous pay period</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${totalDiff > 0 ? 'text-rose-400' : totalDiff < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
          {totalDiff > 0
            ? <TrendingUp size={16} />
            : totalDiff < 0
              ? <TrendingDown size={16} />
              : <Minus size={16} />}
          {totalDiff === 0
            ? 'Same as last period'
            : `${totalDiff > 0 ? '+' : ''}$${Math.abs(totalDiff).toFixed(0)} (${totalPct > 0 ? '+' : ''}${totalPct.toFixed(0)}%)`}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {insights.map(({ cat, curr, prev, diff, pct }) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40"
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
              style={{ backgroundColor: cat.color + '22' }}
            >
              {cat.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{cat.label}</p>
              <p className="text-sm font-bold text-white tabular-nums">${curr.toFixed(0)}</p>
            </div>
            <div className={`text-right flex-shrink-0 ${diff > 0 ? 'text-rose-400' : diff < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <p className="text-xs font-bold">
                {diff === 0 ? '—' : `${diff > 0 ? '+' : ''}$${Math.abs(diff).toFixed(0)}`}
              </p>
              {prev > 0 && diff !== 0 && (
                <p className="text-[10px]">
                  {pct > 0 ? '+' : ''}{pct.toFixed(0)}%
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
