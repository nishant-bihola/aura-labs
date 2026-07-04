'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useCategories } from '@/lib/categories';
import { DollarSign, TrendingDown, TrendingUp, Percent, Settings } from 'lucide-react';

export default function SummaryCards() {
  const payAmount = useStore((s) => s.payAmount);
  const budget = useStore((s) => s.budget);
  const getCurrentPeriod = useStore((s) => s.getCurrentPeriod);
  const getCategorySpend = useStore((s) => s.getCategorySpend);
  const getPeriodIncome = useStore((s) => s.getPeriodIncome);
  const { categoryIds } = useCategories();

  const period = getCurrentPeriod();
  const spending = getCategorySpend(period?.id);
  const extraIncome = getPeriodIncome(period?.id);
  const totalSpent = Object.values(spending).reduce((a, b) => a + b, 0);
  const totalBudgeted = categoryIds.reduce((a, id) => a + (budget[id] ?? 0), 0);
  const totalIn = payAmount + extraIncome;
  const remaining = (payAmount > 0 ? totalIn : totalBudgeted + extraIncome) - totalSpent;
  const savingsRate = totalIn > 0 ? (remaining / totalIn) * 100 : 0;
  const spentPct = totalIn > 0 ? Math.round((totalSpent / totalIn) * 100) : 0;

  if (payAmount === 0) {
    return (
      <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Settings size={20} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">Set up your budget to get started</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter your biweekly income and spending limits to see your financial overview.
          </p>
        </div>
        <Link href="/budget" className="btn-primary text-sm flex-shrink-0">
          Set up budget →
        </Link>
      </div>
    );
  }

  const cards = [
    {
      label: 'Income This Period',
      value: `$${totalIn.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`,
      sub: extraIncome > 0 ? `paycheck + $${extraIncome.toFixed(0)} extra` : 'biweekly paycheck',
      Icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Total Spent',
      value: `$${totalSpent.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`,
      sub: `${spentPct}% of income`,
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
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{label}</p>
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
