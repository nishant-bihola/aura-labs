'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useCategories } from '@/lib/categories';
import { format, parseISO } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontSize: '13px',
  },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8' },
};

export default function AnalyticsPage() {
  const transactions = useStore((s) => s.transactions);
  const payPeriods = useStore((s) => s.payPeriods);
  const budget = useStore((s) => s.budget);
  const getCategorySpend = useStore((s) => s.getCategorySpend);
  const getCurrentPeriod = useStore((s) => s.getCurrentPeriod);
  const payAmount = useStore((s) => s.payAmount);
  const { categories } = useCategories();

  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const currentPeriod = getCurrentPeriod();
  const periodId = selectedPeriod === 'current' ? currentPeriod?.id : selectedPeriod;

  const spending = getCategorySpend(periodId);

  const activePeriods = payPeriods.filter((p) =>
    transactions.some((t) => t.payPeriodId === p.id)
  );
  const otherActivePeriods = activePeriods.filter((p) => p.id !== currentPeriod?.id);

  const pieData = categories.map((cat) => ({
    name: cat.label,
    value: spending[cat.id] ?? 0,
    color: cat.color,
  })).filter((d) => d.value > 0);

  const barData = categories.map((cat) => ({
    name: cat.icon + ' ' + cat.label.split(' ')[0],
    Budget: budget[cat.id] ?? 0,
    Spent: spending[cat.id] ?? 0,
  }));

  const trendPeriods = activePeriods.slice(-8);
  const lineData = trendPeriods.map((p) => {
    const txns = transactions.filter((t) => t.payPeriodId === p.id);
    const total = txns.reduce((a, t) => a + t.amount, 0);
    return {
      period: format(parseISO(p.startDate), 'MMM d'),
      Spent: parseFloat(total.toFixed(2)),
      ...(payAmount > 0
        ? {
            Income: payAmount,
            Saved: parseFloat((payAmount - total).toFixed(2)),
          }
        : {}),
    };
  });

  const totalAllTime = transactions.reduce((a, t) => a + t.amount, 0);
  const avgPerTx = transactions.length > 0 ? totalAllTime / transactions.length : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Visual breakdown of your spending habits
          </p>
        </div>
        <select
          className="input sm:w-56"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="current">Current Period</option>
          {otherActivePeriods.map((p) => (
            <option key={p.id} value={p.id}>
              {format(parseISO(p.startDate), 'MMM d')} –{' '}
              {format(parseISO(p.endDate), 'MMM d, yyyy')}
            </option>
          ))}
        </select>
      </div>

      {transactions.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium text-slate-300">No data yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Add transactions to see your analytics
          </p>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-4">Spending by Category</h2>
              {pieData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                  No spending in this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(v: number) => [`$${v.toFixed(2)}`, '']}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card p-5">
              <h2 className="font-semibold text-white mb-4">Budget vs Actual</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    {...TOOLTIP_STYLE}
                    formatter={(v: number) => [`$${v.toFixed(2)}`, '']}
                  />
                  <Legend
                    formatter={(v) => (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>{v}</span>
                    )}
                  />
                  <Bar dataKey="Budget" fill="#334155" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {lineData.length > 1 && (
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-4">
                Spending Trend — Last {lineData.length} Pay Periods
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData} margin={{ top: 5, right: 20, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    {...TOOLTIP_STYLE}
                    formatter={(v: number) => [`$${v.toFixed(2)}`, '']}
                  />
                  <Legend
                    formatter={(v) => (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>{v}</span>
                    )}
                  />
                  {payAmount > 0 && (
                    <Line type="monotone" dataKey="Income" stroke="#34d399" strokeWidth={2} dot={false} strokeDasharray="5 4" />
                  )}
                  <Line
                    type="monotone"
                    dataKey="Spent"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    dot={{ fill: '#818cf8', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  {payAmount > 0 && (
                    <Line type="monotone" dataKey="Saved" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3, strokeWidth: 0 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4">All-Time Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Transactions', value: transactions.length.toString(), color: 'text-indigo-400' },
                { label: 'Total Spent', value: `$${totalAllTime.toLocaleString('en-CA', { minimumFractionDigits: 0 })}`, color: 'text-rose-400' },
                { label: 'Avg per Transaction', value: `$${avgPerTx.toFixed(2)}`, color: 'text-amber-400' },
                { label: 'Periods Tracked', value: activePeriods.length.toString(), color: 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4">Category Breakdown (All Time)</h2>
            <div className="space-y-3">
              {categories.map((cat) => {
                const allTimeSpend = transactions
                  .filter((t) => t.category === cat.id)
                  .reduce((a, t) => a + t.amount, 0);
                return { cat, allTimeSpend };
              })
                .sort((a, b) => b.allTimeSpend - a.allTimeSpend)
                .map(({ cat, allTimeSpend }) => {
                  const pct = totalAllTime > 0 ? (allTimeSpend / totalAllTime) * 100 : 0;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span>{cat.icon}</span>
                          <span className="text-slate-300 font-medium">{cat.label}</span>
                        </div>
                        <div className="text-sm text-right">
                          <span className="font-bold text-white tabular-nums">
                            ${allTimeSpend.toFixed(2)}
                          </span>
                          <span className="text-slate-500 ml-2">{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
