'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useCategories } from '@/lib/categories';
import { differenceInDays, format, parseISO, startOfDay } from 'date-fns';
import { CalendarClock, Check, Zap } from 'lucide-react';

export default function UpcomingBills() {
  const bills = useStore((s) => s.bills);
  const payBill = useStore((s) => s.payBill);
  const { categoryMap } = useCategories();

  if (bills.length === 0) return null;

  const today = startOfDay(new Date());
  const upcoming = [...bills]
    .sort((a, b) => a.nextDue.localeCompare(b.nextDue))
    .slice(0, 5);

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock size={16} className="text-indigo-400" />
          <h2 className="font-semibold text-white">Upcoming Bills</h2>
        </div>
        <Link href="/budget" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          Manage →
        </Link>
      </div>
      <div className="divide-y divide-slate-800/60">
        {upcoming.map((bill) => {
          const cat = categoryMap[bill.category] ?? { label: bill.category, color: '#64748b', icon: '📦' };
          const daysUntil = differenceInDays(startOfDay(parseISO(bill.nextDue)), today);
          const overdue = daysUntil < 0;
          const dueToday = daysUntil === 0;
          const soon = daysUntil > 0 && daysUntil <= 3;

          return (
            <div key={bill.id} className="flex items-center gap-3 px-5 py-3">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: cat.color + '22' }}
              >
                {cat.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate flex items-center gap-1.5">
                  {bill.label}
                  {bill.autopay && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-sky-400 bg-sky-500/10 px-1 py-0.5 rounded uppercase">
                      <Zap size={8} /> auto
                    </span>
                  )}
                </p>
                <p className="text-xs mt-0.5">
                  <span
                    className={
                      overdue
                        ? 'text-rose-400 font-semibold'
                        : dueToday
                          ? 'text-amber-400 font-semibold'
                          : soon
                            ? 'text-amber-400'
                            : 'text-slate-500'
                    }
                  >
                    {overdue
                      ? `${Math.abs(daysUntil)}d overdue`
                      : dueToday
                        ? 'Due today'
                        : `Due in ${daysUntil}d`}
                  </span>
                  <span className="text-slate-600"> · {format(parseISO(bill.nextDue), 'MMM d')}</span>
                </p>
              </div>
              <span className="text-sm font-bold text-white tabular-nums flex-shrink-0">
                ${bill.amount.toFixed(2)}
              </span>
              <button
                onClick={() => payBill(bill.id)}
                className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
                title="Log payment and advance due date"
              >
                <Check size={12} /> Pay
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
