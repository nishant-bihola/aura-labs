'use client';

import { useStore } from '@/lib/store';
import { DollarSign, TrendingDown, TrendingUp, Percent } from 'lucide-react';

export default function SummaryCards() {
  const payAmount = useStore((s) => s.payAmount);
  const getCurrentPeriod = useStore((s) => s.getCurrentPeriod);
  const getCategorySpend = useStore((s) => s.getCategorySpend);

  const period = getCurrentPeriod();
  const spending = getCategorySpend(period?.id);
  const totalSpent = Object.values(spending).reduce((a, b) => a + b, 0);
  const remaining = payAmount - totalSpent;
  const savingsRate = payAmount > 0 ? (remaining / payAmount) * 100 : 0;
  const spentPct = payAmount > 0 ? Math.round((totalSpent / payAmount) * 100) : 0;

  const cards = [
    {
      label: 'Biweekly Income',
      value: payAmount > 0 ? `$${payAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}` : '—',
      sub: 'this pay period',
      Icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Total Spent',
      value: `$${totalSpent.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`,
      sub: payAmount > 0 ? `${spentPct}% of income` : 'this period',
      Icon: TrendingDown,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'Remaining',
      value: `$${Math.max(0, remaining).toLocaleString('en-CA', { minimumFractionDigits: 2 })}`,
      sub: remaining < 0 ? '⚠️ over budget' : 'available to spend',
      Icon: TrendingUp,
      color: remaining >= 0 ? 'text-blue-400' : 'text-rose-400',
      bg: remaining >= 0 ? 'bg-blue-500/10' : 'bg-rose-500/10',
    },
    {
      label: 'Savings Rate',
      value: `${Math.max(0, savingsRate).toFixed(1)}%`,
      sub: savingsRate >= 20 ? '🎯 great job!' : savingsRate >= 10 ? 'keep going' : 'aim for 20%+',
      Icon: Percent,
      color: savingsRate >= 20 ? 'text-emerald-400' : savingsRate >= 10 ? 'text-amber-400' : 'text-rose-400',
      bg: savingsRate >= 20 ? 'bg-emerald-500/10' : savingsRate >= 10 ? 'bg-amber-500/10' : 'bg-rose-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, Icon, color, bg }) => (
        <div key={label} className="card p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">
              {label}
            </p>
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon size={16} className={color} />
            </div>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
          <p className="text-xs text-slate-500 mt-1">{sub}</p>
        </div>
      ))}
    </div>
  );
}
