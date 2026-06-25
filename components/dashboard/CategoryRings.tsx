'use client';

import { useStore } from '@/lib/store';
import { CATEGORIES, CATEGORY_KEYS } from '@/lib/types';

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

  const period = getCurrentPeriod();
  const spending = getCategorySpend(period?.id);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="font-semibold text-white">Budget Status</h2>
        <p className="text-xs text-slate-500 mt-0.5">Current pay period spending vs budget</p>
      </div>
      <div className="card-body grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORY_KEYS.map((cat) => {
          const spent = spending[cat] ?? 0;
          const alloc = budget[cat] ?? 0;
          const pct = alloc > 0 ? (spent / alloc) * 100 : 0;
          const { label, color, icon } = CATEGORIES[cat];
          const isOver = pct > 100;
          const isWarn = pct > 80 && !isOver;

          return (
            <div key={cat} className="flex flex-col items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
              <div className="relative flex-shrink-0">
                <Ring pct={pct} color={color} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">{icon}</span>
                </div>
              </div>
              <div className="text-center w-full">
                <p className="text-[11px] font-semibold text-slate-300 leading-tight">{label}</p>
                <p className="text-sm font-bold text-white mt-1 tabular-nums">${spent.toFixed(0)}</p>
                <p className="text-[10px] text-slate-500">of ${alloc.toFixed(0)}</p>
                {alloc > 0 && (
                  <p className={`text-[10px] font-bold mt-0.5 ${
                    isOver ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {isOver ? `$${(spent - alloc).toFixed(0)} over` : `$${(alloc - spent).toFixed(0)} left`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
