'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { CATEGORY_COLORS } from '@/lib/types';
import { Target, Plus, Trash2, Minus } from 'lucide-react';
import clsx from 'clsx';

const GOAL_EMOJIS = ['🎯', '✈️', '🏠', '🚗', '💍', '🎓', '🛡️', '💻', '🎁', '🏖️'];

export default function Goals() {
  const goals = useStore((s) => s.goals);
  const addGoal = useStore((s) => s.addGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const contributeToGoal = useStore((s) => s.contributeToGoal);

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [target, setTarget] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [contributingId, setContributingId] = useState<string | null>(null);
  const [contribution, setContribution] = useState('');

  const handleAdd = () => {
    const t = parseFloat(target);
    if (!label.trim() || !t || t <= 0) return;
    addGoal({
      label: label.trim(),
      target: t,
      icon,
      color: CATEGORY_COLORS[goals.length % CATEGORY_COLORS.length],
    });
    setLabel('');
    setTarget('');
    setIcon('🎯');
    setAdding(false);
  };

  const handleContribute = (id: string, sign: 1 | -1) => {
    const amt = parseFloat(contribution);
    if (!amt || amt <= 0) return;
    contributeToGoal(id, amt * sign);
    setContribution('');
    setContributingId(null);
  };

  if (goals.length === 0 && !adding) {
    return (
      <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Target size={20} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">Savings Goals</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Save toward a vacation, emergency fund, or anything else — one paycheck at a time.
          </p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary text-sm flex items-center gap-1.5 flex-shrink-0">
          <Plus size={14} /> Create goal
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-indigo-400" />
          <h2 className="font-semibold text-white">Savings Goals</h2>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> New goal
          </button>
        )}
      </div>

      <div className="card-body space-y-4">
        {adding && (
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="label text-xs">Goal name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Emergency fund"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  autoFocus
                  maxLength={30}
                />
              </div>
              <div className="w-32">
                <label className="label text-xs">Target ($)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="input"
                  placeholder="1000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={clsx(
                    'w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all',
                    icon === em ? 'bg-indigo-600 ring-1 ring-indigo-400' : 'bg-slate-800 hover:bg-slate-700'
                  )}
                >
                  {em}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setAdding(false); setLabel(''); setTarget(''); }}
                className="btn-ghost flex-1 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!label.trim() || !(parseFloat(target) > 0)}
                className="btn-primary flex-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Goal
              </button>
            </div>
          </div>
        )}

        {goals.map((g) => {
          const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
          const done = g.saved >= g.target;
          const isContributing = contributingId === g.id;

          return (
            <div key={g.id} className="group">
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg flex-shrink-0">{g.icon}</span>
                  <span className="text-sm font-semibold text-slate-200 truncate">{g.label}</span>
                  {done && <span className="text-xs">🎉</span>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm tabular-nums">
                    <span className="font-bold text-white">${g.saved.toLocaleString()}</span>
                    <span className="text-slate-500"> / ${g.target.toLocaleString()}</span>
                  </span>
                  <button
                    onClick={() => { setContributingId(isContributing ? null : g.id); setContribution(''); }}
                    className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-600 bg-indigo-500/10 rounded-lg transition-colors"
                    title="Add money"
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    onClick={() => { if (window.confirm(`Delete goal "${g.label}"?`)) deleteGoal(g.id); }}
                    className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: done ? '#34d399' : g.color }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {done
                  ? 'Goal reached! 🎉'
                  : `${pct.toFixed(0)}% — $${(g.target - g.saved).toLocaleString()} to go`}
              </p>

              {isContributing && (
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="input pl-7"
                      placeholder="Amount"
                      value={contribution}
                      onChange={(e) => setContribution(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleContribute(g.id, 1); }}
                    />
                  </div>
                  <button
                    onClick={() => handleContribute(g.id, 1)}
                    className="btn-primary text-sm flex items-center gap-1 px-3"
                  >
                    <Plus size={13} /> Add
                  </button>
                  <button
                    onClick={() => handleContribute(g.id, -1)}
                    className="btn-ghost border border-slate-700 text-sm flex items-center gap-1 px-3"
                    title="Withdraw"
                  >
                    <Minus size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
