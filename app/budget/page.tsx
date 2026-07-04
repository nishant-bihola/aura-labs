'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useCategories } from '@/lib/categories';
import { CATEGORY_COLORS, BillFrequency } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Info, CheckCircle2, AlertTriangle, Plus, Pencil, Trash2, Check, CalendarClock, Zap } from 'lucide-react';
import clsx from 'clsx';

const EMOJI_SUGGESTIONS = ['🛒','🍔','☕','🎬','✈️','🏋️','💊','📚','🎮','👔','💻','🏠','🐶','🌿','🎵','🚌','💳','🎁','🔧','🏖️'];

interface CatFormState {
  label: string;
  icon: string;
  color: string;
}

const EMPTY_CAT: CatFormState = { label: '', icon: '📦', color: '#818cf8' };

export default function BudgetPage() {
  const payAmount = useStore((s) => s.payAmount);
  const budget = useStore((s) => s.budget);
  const firstPayDate = useStore((s) => s.firstPayDate);
  const transactions = useStore((s) => s.transactions);
  const setPayAmount = useStore((s) => s.setPayAmount);
  const setBudget = useStore((s) => s.setBudget);
  const setFirstPayDate = useStore((s) => s.setFirstPayDate);
  const addCategory = useStore((s) => s.addCategory);
  const updateCategory = useStore((s) => s.updateCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);
  const bills = useStore((s) => s.bills);
  const addBill = useStore((s) => s.addBill);
  const updateBill = useStore((s) => s.updateBill);
  const deleteBill = useStore((s) => s.deleteBill);

  const { categories } = useCategories();

  const [localPay, setLocalPay] = useState('');
  const [localDate, setLocalDate] = useState('');
  const [localBudget, setLocalBudget] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState<CatFormState>({ ...EMPTY_CAT });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatForm, setEditCatForm] = useState<CatFormState>({ ...EMPTY_CAT });

  // Recurring bill form state; editingBillId === 'new' means the add form is open
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [billForm, setBillForm] = useState({
    label: '',
    amount: '',
    category: 'others',
    frequency: 'monthly' as BillFrequency,
    nextDue: '',
    autopay: false,
  });

  useEffect(() => {
    setLocalPay(payAmount > 0 ? payAmount.toString() : '');
    setLocalDate(firstPayDate);
    const init: Record<string, string> = {};
    categories.forEach((c) => {
      init[c.id] = (budget[c.id] ?? 0) > 0 ? budget[c.id].toString() : '';
    });
    setLocalBudget(init);
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payAmount, budget, firstPayDate]);

  // Ensure new custom categories get an empty field without wiping unsaved edits
  useEffect(() => {
    setLocalBudget((prev) => {
      const next = { ...prev };
      categories.forEach((c) => {
        if (!(c.id in next)) next[c.id] = '';
      });
      return next;
    });
  }, [categories]);

  const income = parseFloat(localPay) || 0;
  const totalAllocated = categories.reduce((a, c) => a + (parseFloat(localBudget[c.id]) || 0), 0);
  const unallocated = income - totalAllocated;
  const dateChanged = localDate !== firstPayDate && transactions.length > 0;

  const handleSave = () => {
    setPayAmount(parseFloat(localPay) || 0);
    setFirstPayDate(localDate);
    categories.forEach((cat) => {
      setBudget(cat.id, parseFloat(localBudget[cat.id]) || 0);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddCategory = () => {
    if (!newCat.label.trim()) return;
    addCategory({ label: newCat.label.trim(), icon: newCat.icon, color: newCat.color });
    setNewCat({ ...EMPTY_CAT });
    setAddingCat(false);
  };

  const handleStartEdit = (id: string, label: string, icon: string, color: string) => {
    setEditingCatId(id);
    setEditCatForm({ label, icon, color });
  };

  const handleSaveEdit = () => {
    if (!editingCatId || !editCatForm.label.trim()) return;
    updateCategory(editingCatId, {
      label: editCatForm.label.trim(),
      icon: editCatForm.icon,
      color: editCatForm.color,
    });
    setEditingCatId(null);
  };

  const handleDeleteCat = (id: string, label: string) => {
    const count = transactions.filter((t) => t.category === id).length;
    const msg = count > 0
      ? `Delete "${label}"? ${count} transaction${count !== 1 ? 's' : ''} will be moved to "Others".`
      : `Delete "${label}"?`;
    if (window.confirm(msg)) deleteCategory(id);
  };

  const openBillForm = (billId: string | 'new') => {
    if (billId === 'new') {
      setBillForm({
        label: '',
        amount: '',
        category: 'others',
        frequency: 'monthly',
        nextDue: format(new Date(), 'yyyy-MM-dd'),
        autopay: false,
      });
    } else {
      const b = bills.find((x) => x.id === billId);
      if (!b) return;
      setBillForm({
        label: b.label,
        amount: b.amount.toString(),
        category: b.category,
        frequency: b.frequency,
        nextDue: b.nextDue,
        autopay: b.autopay,
      });
    }
    setEditingBillId(billId);
  };

  const handleSaveBill = () => {
    const amount = parseFloat(billForm.amount);
    if (!billForm.label.trim() || !amount || amount <= 0 || !billForm.nextDue) return;
    const payload = {
      label: billForm.label.trim(),
      amount,
      category: billForm.category,
      frequency: billForm.frequency,
      nextDue: billForm.nextDue,
      autopay: billForm.autopay,
    };
    if (editingBillId === 'new') {
      addBill(payload);
    } else if (editingBillId) {
      updateBill(editingBillId, payload);
    }
    setEditingBillId(null);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Budget Setup</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Configure your biweekly income, spending limits, and categories
        </p>
      </div>

      {/* Paycheck Settings */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2 text-base">
          <span className="text-xl">💰</span> Paycheck Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Biweekly Net Income</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input pl-7"
                placeholder="e.g. 2400.00"
                value={localPay}
                onChange={(e) => setLocalPay(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">First Pay Date</label>
            <input
              type="date"
              className="input"
              value={localDate}
              onChange={(e) => setLocalDate(e.target.value)}
            />
          </div>
        </div>

        {dateChanged && (
          <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded-xl p-3">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
            <span>
              Changing the first pay date will re-assign all{' '}
              <strong>{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</strong>{' '}
              to the new biweekly schedule.
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-800/40 rounded-xl p-3">
          <Info size={13} className="flex-shrink-0 mt-0.5" />
          <span>
            Enter your after-tax take-home pay. The first pay date anchors all biweekly periods.
          </span>
        </div>
      </div>

      {/* Income allocation bar */}
      {income > 0 && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-white text-base">Income Allocation</h2>
            <span className={clsx('text-sm font-bold', unallocated >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {unallocated >= 0
                ? `$${unallocated.toFixed(0)} unallocated`
                : `$${Math.abs(unallocated).toFixed(0)} over-allocated`}
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
            {categories.map((cat) => {
              const pct = ((parseFloat(localBudget[cat.id]) || 0) / income) * 100;
              return pct > 0 ? (
                <div
                  key={cat.id}
                  className="h-full transition-all duration-300"
                  style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: cat.color }}
                  title={`${cat.label}: ${pct.toFixed(1)}%`}
                />
              ) : null;
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {categories.map((cat) => {
              const pct = ((parseFloat(localBudget[cat.id]) || 0) / income) * 100;
              if (pct === 0) return null;
              return (
                <div key={cat.id} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  {cat.label} {pct.toFixed(0)}%
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-category limits */}
      <div className="card p-5 space-y-5">
        <div>
          <h2 className="font-semibold text-white text-base">Per-Category Limits</h2>
          <p className="text-xs text-slate-500 mt-1">Amount you plan to spend each pay period</p>
        </div>

        {categories.map((cat) => {
          const val = parseFloat(localBudget[cat.id]) || 0;
          const pct = income > 0 ? (val / income) * 100 : 0;
          return (
            <div key={cat.id}>
              <div className="flex items-center justify-between mb-2 gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl flex-shrink-0">{cat.icon}</span>
                  <span className="text-sm font-semibold text-slate-200 truncate">{cat.label}</span>
                  {income > 0 && val > 0 && (
                    <span className="text-xs text-slate-500 flex-shrink-0">{pct.toFixed(0)}%</span>
                  )}
                </div>
                <div className="relative w-32 flex-shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="input pl-7 pr-2 text-right tabular-nums"
                    placeholder="0"
                    value={localBudget[cat.id] ?? ''}
                    onChange={(e) => setLocalBudget((b) => ({ ...b, [cat.id]: e.target.value }))}
                  />
                </div>
              </div>
              {income > 0 && (
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: cat.color }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        className={clsx(
          'w-full py-3 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2',
          saved ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'btn-primary'
        )}
      >
        {saved ? <><CheckCircle2 size={18} /> Saved!</> : 'Save Budget Settings'}
      </button>

      {/* ── Category Management ── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white text-base">Manage Categories</h2>
            <p className="text-xs text-slate-500 mt-1">Add your own spending categories with custom emoji and color</p>
          </div>
          {!addingCat && (
            <button
              onClick={() => setAddingCat(true)}
              className="btn-primary text-sm flex items-center gap-1.5 py-1.5 px-3"
            >
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        {addingCat && (
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700">
            <p className="text-sm font-semibold text-slate-200">New Category</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="label text-xs">Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Groceries"
                  value={newCat.label}
                  onChange={(e) => setNewCat((f) => ({ ...f, label: e.target.value }))}
                  autoFocus
                  maxLength={24}
                />
              </div>
              <div className="w-20">
                <label className="label text-xs">Emoji</label>
                <input
                  type="text"
                  className="input text-center text-xl px-1"
                  value={newCat.icon}
                  onChange={(e) => {
                    const v = Array.from(e.target.value).slice(-1).join('') || '📦';
                    setNewCat((f) => ({ ...f, icon: v }));
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Quick emoji</p>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_SUGGESTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setNewCat((f) => ({ ...f, icon: em }))}
                    className={clsx(
                      'w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all',
                      newCat.icon === em ? 'bg-indigo-600 ring-1 ring-indigo-400' : 'bg-slate-800 hover:bg-slate-700'
                    )}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Color</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewCat((f) => ({ ...f, color: col }))}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: col }}
                  >
                    {newCat.color === col && <Check size={12} className="text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Preview:</span>
              <span
                className="px-2.5 py-1 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: newCat.color + '22', color: newCat.color }}
              >
                {newCat.icon} {newCat.label || 'Category'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setAddingCat(false); setNewCat({ ...EMPTY_CAT }); }}
                className="btn-ghost flex-1 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCat.label.trim()}
                className="btn-primary flex-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Category
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {categories.map((cat) => {
            if (editingCatId === cat.id) {
              return (
                <div key={cat.id} className="bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="label text-xs">Name</label>
                      <input
                        type="text"
                        className="input"
                        value={editCatForm.label}
                        onChange={(e) => setEditCatForm((f) => ({ ...f, label: e.target.value }))}
                        maxLength={24}
                        autoFocus
                      />
                    </div>
                    <div className="w-20">
                      <label className="label text-xs">Emoji</label>
                      <input
                        type="text"
                        className="input text-center text-xl px-1"
                        value={editCatForm.icon}
                        onChange={(e) => {
                          const v = Array.from(e.target.value).slice(-1).join('') || '📦';
                          setEditCatForm((f) => ({ ...f, icon: v }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setEditCatForm((f) => ({ ...f, color: col }))}
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: col }}
                      >
                        {editCatForm.color === col && <Check size={12} className="text-white" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditingCatId(null)} className="btn-ghost flex-1 border border-slate-700 text-sm">Cancel</button>
                    <button type="button" onClick={handleSaveEdit} className="btn-primary flex-1 text-sm">Save</button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors group"
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: cat.color + '22' }}
                >
                  {cat.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{cat.label}</p>
                  {cat.isDefault && <p className="text-[10px] text-slate-600">Built-in</p>}
                </div>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                {!cat.isDefault && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(cat.id, cat.label, cat.icon, cat.color)}
                      className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteCat(cat.id, cat.label)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recurring Bills ── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white text-base flex items-center gap-2">
              <CalendarClock size={16} className="text-indigo-400" /> Recurring Bills
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Bills show on your dashboard when due — one tap logs the payment and rolls the date forward
            </p>
          </div>
          {editingBillId === null && (
            <button
              onClick={() => openBillForm('new')}
              className="btn-primary text-sm flex items-center gap-1.5 py-1.5 px-3 flex-shrink-0"
            >
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        {editingBillId !== null && (
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700">
            <p className="text-sm font-semibold text-slate-200">
              {editingBillId === 'new' ? 'New Bill' : 'Edit Bill'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Phone plan"
                  value={billForm.label}
                  onChange={(e) => setBillForm((f) => ({ ...f, label: e.target.value }))}
                  autoFocus
                  maxLength={30}
                />
              </div>
              <div>
                <label className="label text-xs">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input pl-7"
                    placeholder="0.00"
                    value={billForm.amount}
                    onChange={(e) => setBillForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="label text-xs">Category</label>
                <select
                  className="input"
                  value={billForm.category}
                  onChange={(e) => setBillForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Repeats</label>
                <select
                  className="input"
                  value={billForm.frequency}
                  onChange={(e) => setBillForm((f) => ({ ...f, frequency: e.target.value as BillFrequency }))}
                >
                  <option value="monthly">Every month</option>
                  <option value="biweekly">Every 2 weeks</option>
                </select>
              </div>
              <div>
                <label className="label text-xs">Next due date</label>
                <input
                  type="date"
                  className="input"
                  value={billForm.nextDue}
                  onChange={(e) => setBillForm((f) => ({ ...f, nextDue: e.target.value }))}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-indigo-600"
                    checked={billForm.autopay}
                    onChange={(e) => setBillForm((f) => ({ ...f, autopay: e.target.checked }))}
                  />
                  <Zap size={13} className="text-sky-400" /> On autopay
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingBillId(null)}
                className="btn-ghost flex-1 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBill}
                disabled={!billForm.label.trim() || !(parseFloat(billForm.amount) > 0)}
                className="btn-primary flex-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editingBillId === 'new' ? 'Add Bill' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {bills.length === 0 && editingBillId === null ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No recurring bills yet. Add your phone plan, insurance, subscriptions…
          </p>
        ) : (
          <div className="space-y-1">
            {[...bills]
              .sort((a, b) => a.nextDue.localeCompare(b.nextDue))
              .map((bill) => {
                const cat = categories.find((c) => c.id === bill.category);
                return (
                  <div
                    key={bill.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors group"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: (cat?.color ?? '#64748b') + '22' }}
                    >
                      {cat?.icon ?? '📦'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate flex items-center gap-1.5">
                        {bill.label}
                        {bill.autopay && <Zap size={11} className="text-sky-400 flex-shrink-0" />}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {bill.frequency === 'monthly' ? 'Monthly' : 'Biweekly'} · next{' '}
                        {format(parseISO(bill.nextDue), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-white tabular-nums flex-shrink-0">
                      ${bill.amount.toFixed(2)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                      <button
                        onClick={() => openBillForm(bill.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => { if (window.confirm(`Delete bill "${bill.label}"?`)) deleteBill(bill.id); }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
