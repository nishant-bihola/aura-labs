'use client';

import { useStore } from '@/lib/store';
import { CATEGORY_KEYS } from '@/lib/types';

export default function HealthScore() {
  const payAmount = useStore((s) => s.payAmount);
  const budget = useStore((s) => s.budget);
  const transactions = useStore((s) => s.transactions);
  const getCurrentPeriod = useStore((s) => s.getCurrentPeriod);
  const getCategorySpend = useStore((s) => s.getCategorySpend);

  const period = getCurrentPeriod();
  const spending = getCategorySpend(period?.id);
  const totalSpent = Object.values(spending).reduce((a, b) => a + b, 0);
  const remaining = payAmount - totalSpent;
  const savingsRate = payAmount > 0 ? (remaining / payAmount) * 100 : 0;

  const savingsScore = Math.min(40, Math.max(0, (savingsRate / 20) * 40));

  const totalBudget = CATEGORY_KEYS.reduce((a, c) => a + (budget[c] ?? 0), 0);
  const overBudgetPenalty = CATEGORY_KEYS.reduce((pen, c) => pen + Math.max(0, spending[c] - budget[c]), 0);
  const adherence = totalBudget > 0 ? Math.max(0, 1 - overBudgetPenalty / totalBudget) : 0;
  const budgetScore = adherence * 30;

  const txScore = Math.min(30, transactions.length * 3);

  const score = Math.round(savingsScore + budgetScore + txScore);
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
  const gradeColor = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'On Track' : 'Needs Work';
  const tip =
    score >= 80
      ? 'Your budget management is top-notch!'
      : score >= 60
        ? 'Making good progress. Keep tracking!'
        : 'Set budget limits and log more transactions to improve your score.';

  const size = 88;
  const strokeW = 8;
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-white mb-4">Budget Health Score</h2>
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={strokeW} />
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={gradeColor}
              strokeWidth={strokeW}
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black" style={{ color: gradeColor }}>{grade}</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">{label}</span>
              <span className="text-sm font-bold" style={{ color: gradeColor }}>{score}/100</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${score}%`, backgroundColor: gradeColor }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Savings', val: Math.round(savingsScore), max: 40 },
              { label: 'Adherence', val: Math.round(budgetScore), max: 30 },
              { label: 'Tracking', val: Math.round(txScore), max: 30 },
            ].map(({ label, val, max }) => (
              <div key={label} className="bg-slate-800/50 rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-white">
                  {val}<span className="text-xs text-slate-500">/{max}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400">{tip}</p>
        </div>
      </div>
    </div>
  );
}
