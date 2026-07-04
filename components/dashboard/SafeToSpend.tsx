'use client';

import { useStore } from '@/lib/store';
import { differenceInDays, parseISO } from 'date-fns';
import { Gauge } from 'lucide-react';

export default function SafeToSpend() {
  const payAmount = useStore((s) => s.payAmount);
  const getCurrentPeriod = useStore((s) => s.getCurrentPeriod);
  const getCategorySpend = useStore((s) => s.getCategorySpend);
  const getPeriodIncome = useStore((s) => s.getPeriodIncome);

  const period = getCurrentPeriod();
  if (!period || payAmount <= 0) return null;

  const spending = getCategorySpend(period.id);
  const extraIncome = getPeriodIncome(period.id);
  const totalSpent = Object.values(spending).reduce((a, b) => a + b, 0);
  const available = payAmount + extraIncome - totalSpent;

  const today = new Date();
  const daysLeft = Math.max(1, differenceInDays(parseISO(period.endDate), today) + 1);
  const perDay = available / daysLeft;

  // Pace: how far through the period vs how much of the money is gone
  const totalDays = 14;
  const daysElapsed = Math.min(totalDays, Math.max(0, totalDays - daysLeft + 1));
  const timePct = (daysElapsed / totalDays) * 100;
  const spentPct = ((payAmount + extraIncome) > 0 ? totalSpent / (payAmount + extraIncome) : 0) * 100;
  const aheadOfPace = spentPct > timePct + 5;
  const behindPace = spentPct < timePct - 5;

  const paceMsg = aheadOfPace
    ? `You're spending faster than the period is passing (${spentPct.toFixed(0)}% spent, ${timePct.toFixed(0)}% through). Ease off a little.`
    : behindPace
      ? `Nice pace — ${timePct.toFixed(0)}% through the period but only ${spentPct.toFixed(0)}% spent.`
      : `Right on pace: ${spentPct.toFixed(0)}% spent, ${timePct.toFixed(0)}% through the period.`;
  const paceColor = aheadOfPace ? 'text-rose-400' : behindPace ? 'text-emerald-400' : 'text-slate-400';

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Gauge size={16} className="text-indigo-400" />
        <h2 className="font-semibold text-white">Safe to Spend</h2>
      </div>

      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`text-3xl font-bold tabular-nums ${perDay >= 0 ? 'text-white' : 'text-rose-400'}`}>
          ${Math.max(0, perDay).toFixed(0)}
          <span className="text-base font-semibold text-slate-400">/day</span>
        </span>
        <span className="text-sm text-slate-500">
          for the next {daysLeft} day{daysLeft !== 1 ? 's' : ''}
        </span>
      </div>

      <p className="text-xs text-slate-500 mt-1">
        ${Math.max(0, available).toFixed(2)} left
        {extraIncome > 0 && <span className="text-emerald-400"> (includes +${extraIncome.toFixed(0)} extra income)</span>}
      </p>

      {/* Pace bars: time vs money */}
      <div className="mt-4 space-y-2">
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Period elapsed</span>
            <span>{timePct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-slate-500 rounded-full transition-all duration-700" style={{ width: `${timePct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Money spent</span>
            <span>{Math.min(999, spentPct).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${aheadOfPace ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, spentPct)}%` }}
            />
          </div>
        </div>
      </div>

      <p className={`text-xs mt-3 ${paceColor}`}>{paceMsg}</p>
    </div>
  );
}
