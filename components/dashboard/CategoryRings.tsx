'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useCategories } from '@/lib/categories';

function Ring({ pct, color }: { pct: number; color: string }) {
  const size = 72;
  const strokeW = 6;
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(pct, 100);
  const offset = circ - (clamped / 100) * circ;
  const isOver = pct > 100;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={strokeW} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={isOver ? '#f87171' : color}
        strokeWidth={strokeW}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

export default function CategoryRings() {
  const budget = useStore((s) => s.budget);
  const getCurrentPeriod = useStore((s) => s.getCurrentPeriod);
  const getCategorySpend = useStore((s) => s.getCategorySpend);
  const { categories } = useCategories();

  const period = getCurrentPeriod();
  const spending = getCategorySpend(period?.id);

  const hasBudget = categories.some((c) => (budget[c.id] ?? 0) > 0);

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Budget Status</h2>
          <p className="text-xs text-slate-500 mt-0.5">Current pay period spending vs budget</p>
        </div>
        {!hasBudget && (
          <Link href="/budget" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Set limits →
          </Link>
        )}
      </div>
      <div className="card-body grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const spent = spending[cat.id] ?? 0;
          const alloc = budget[cat.id] ?? 0;
          const pct = alloc > 0 ? (spent / alloc) * 100 : spent > 0 ? 100 : 0;
          const isOver = alloc > 0 && pct > 100;
          const isWarn = alloc > 0 && pct > 80 && !isOver;

          return (
            <div key={cat.id} className="flex flex-col items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
              <div className="relative flex-shrink-0">
                <Ring pct={pct} color={cat.color} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">{cat.icon}</span>
                </div>
              </div>
              <div className="text-center w-full">
                <p className="text-[11px] font-semibold text-slate-300 leading-tight">{cat.label}</p>
                <p className="text-sm font-bold text-white mt-1 tabular-nums">${spent.toFixed(0)}</p>
                {alloc > 0 ? (
                  <>
                    <p className="text-[10px] text-slate-500">of ${alloc.toFixed(0)}</p>
                    <p className={`text-[10px] font-bold mt-0.5 ${isOver ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isOver ? `$${(spent - alloc).toFixed(0)} over` : `$${(alloc - spent).toFixed(0)} left`}
                    </p>
                  </>
                ) : (
                  <p className="text-[10px] text-slate-600 mt-0.5">no limit</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
