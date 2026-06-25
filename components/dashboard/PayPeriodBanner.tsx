'use client';

import { useStore } from '@/lib/store';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { Calendar, AlertCircle } from 'lucide-react';

export default function PayPeriodBanner() {
  const getCurrentPeriod = useStore((s) => s.getCurrentPeriod);
  const payAmount = useStore((s) => s.payAmount);
  const period = getCurrentPeriod();
  const today = new Date();

  if (!period) {
    return (
      <div className="card p-5 flex items-center gap-3 border-amber-800/40 bg-amber-950/20">
        <AlertCircle size={20} className="text-amber-400 flex-shrink-0" />
        <span className="text-sm text-amber-300">
          No active pay period found. Go to <strong>Budget</strong> and set your first pay date.
        </span>
      </div>
    );
  }

  const endDate = parseISO(period.endDate);
  const startDate = parseISO(period.startDate);
  const daysLeft = Math.max(0, differenceInDays(endDate, today));
  const totalDays = 14;
  const daysPassed = Math.min(totalDays, totalDays - daysLeft);
  const progress = (daysPassed / totalDays) * 100;
  const nextPay = format(addDays(endDate, 1), 'EEE, MMM d');

  return (
    <div className="card p-5 bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-800/30">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar size={20} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Pay Period</p>
            <p className="text-white font-semibold mt-0.5">
              {format(startDate, 'MMM d')} &rarr; {format(endDate, 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex gap-6 text-center sm:text-right">
          <div>
            <p className="text-2xl font-bold text-white tabular-nums">{daysLeft + 1}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">days left</p>
          </div>
          <div>
            <p className="text-lg font-bold text-indigo-300">{nextPay}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">next payday</p>
          </div>
          {payAmount > 0 && (
            <div>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">${payAmount.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">income</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{format(startDate, 'MMM d')}</span>
          <span>{Math.round(progress)}% through period</span>
          <span>{format(endDate, 'MMM d')}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
