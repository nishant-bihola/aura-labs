import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { addDays, addMonths, format, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { CategoryDef, DEFAULT_CATEGORIES, Transaction, BudgetMap, PayPeriod, RecurringBill, Goal } from './types';

function nanoid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makePayPeriods(firstPayDate: string, count = 104): PayPeriod[] {
  const periods: PayPeriod[] = [];
  let start = parseISO(firstPayDate);
  start = addDays(start, -52 * 14);
  for (let i = 0; i < count; i++) {
    periods.push({
      id: nanoid(),
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(addDays(start, 13), 'yyyy-MM-dd'),
    });
    start = addDays(start, 14);
  }
  return periods;
}

function assignPeriod(date: string, periods: PayPeriod[]): string {
  const d = parseISO(date);
  const period = periods.find((p) =>
    isWithinInterval(startOfDay(d), {
      start: startOfDay(parseISO(p.startDate)),
      end: startOfDay(parseISO(p.endDate)),
    })
  );
  return period?.id ?? 'orphan';
}

interface AppState {
  payAmount: number;
  firstPayDate: string;
  payPeriods: PayPeriod[];
  budget: BudgetMap;
  transactions: Transaction[];
  customCategories: CategoryDef[];
  bills: RecurringBill[];
  goals: Goal[];

  setPayAmount: (v: number) => void;
  setFirstPayDate: (d: string) => void;
  setBudget: (cat: string, v: number) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'payPeriodId'>) => void;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id' | 'payPeriodId'>>) => void;
  deleteTransaction: (id: string) => void;
  restoreTransaction: (t: Transaction) => void;
  clearAll: () => void;

  addCategory: (cat: Omit<CategoryDef, 'id' | 'isDefault'>) => void;
  updateCategory: (id: string, patch: Partial<Omit<CategoryDef, 'id' | 'isDefault'>>) => void;
  deleteCategory: (id: string) => void;

  addBill: (b: Omit<RecurringBill, 'id'>) => void;
  updateBill: (id: string, patch: Partial<Omit<RecurringBill, 'id'>>) => void;
  deleteBill: (id: string) => void;
  payBill: (id: string) => void;

  addGoal: (g: Omit<Goal, 'id' | 'saved'>) => void;
  updateGoal: (id: string, patch: Partial<Omit<Goal, 'id'>>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  getAllCategories: () => CategoryDef[];
  getCurrentPeriod: () => PayPeriod | null;
  getPeriodTransactions: (periodId: string) => Transaction[];
  getCategorySpend: (periodId?: string) => BudgetMap;
  getPeriodIncome: (periodId?: string) => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      payAmount: 0,
      firstPayDate: format(new Date(), 'yyyy-MM-dd'),
      payPeriods: makePayPeriods(format(new Date(), 'yyyy-MM-dd')),
      budget: {},
      transactions: [],
      customCategories: [],
      bills: [],
      goals: [],

      setPayAmount: (v) => set({ payAmount: v }),

      setFirstPayDate: (d) => {
        const newPeriods = makePayPeriods(d);
        set((s) => ({
          firstPayDate: d,
          payPeriods: newPeriods,
          transactions: s.transactions.map((t) => ({
            ...t,
            payPeriodId: assignPeriod(t.date, newPeriods),
          })),
        }));
      },

      setBudget: (cat, v) =>
        set((s) => ({ budget: { ...s.budget, [cat]: v } })),

      addTransaction: (t) => {
        const { payPeriods } = get();
        set((s) => ({
          transactions: [
            { ...t, id: nanoid(), payPeriodId: assignPeriod(t.date, payPeriods) },
            ...s.transactions,
          ],
        }));
      },

      updateTransaction: (id, patch) =>
        set((s) => {
          const existing = s.transactions.find((t) => t.id === id);
          if (!existing) return s;
          const updated = { ...existing, ...patch };
          if (patch.date) {
            updated.payPeriodId = assignPeriod(patch.date, s.payPeriods);
          }
          return {
            transactions: s.transactions.map((t) => (t.id === id ? updated : t)),
          };
        }),

      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      restoreTransaction: (t) =>
        set((s) => ({
          transactions: s.transactions.some((x) => x.id === t.id)
            ? s.transactions
            : [t, ...s.transactions],
        })),

      clearAll: () =>
        set((s) => ({
          payAmount: 0,
          firstPayDate: format(new Date(), 'yyyy-MM-dd'),
          payPeriods: makePayPeriods(format(new Date(), 'yyyy-MM-dd')),
          budget: {},
          transactions: [],
          bills: [],
          goals: [],
          customCategories: s.customCategories,
        })),

      addCategory: (cat) =>
        set((s) => ({
          customCategories: [
            ...s.customCategories,
            { ...cat, id: nanoid(), isDefault: false },
          ],
        })),

      updateCategory: (id, patch) =>
        set((s) => ({
          customCategories: s.customCategories.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          customCategories: s.customCategories.filter((c) => c.id !== id),
          transactions: s.transactions.map((t) =>
            t.category === id ? { ...t, category: 'others' } : t
          ),
          bills: s.bills.map((b) =>
            b.category === id ? { ...b, category: 'others' } : b
          ),
        })),

      addBill: (b) =>
        set((s) => ({ bills: [...s.bills, { ...b, id: nanoid() }] })),

      updateBill: (id, patch) =>
        set((s) => ({
          bills: s.bills.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),

      deleteBill: (id) =>
        set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),

      payBill: (id) => {
        const bill = get().bills.find((b) => b.id === id);
        if (!bill) return;
        get().addTransaction({
          date: format(new Date(), 'yyyy-MM-dd'),
          amount: bill.amount,
          category: bill.category,
          description: bill.label,
          type: 'expense',
        });
        const due = parseISO(bill.nextDue);
        const next =
          bill.frequency === 'monthly' ? addMonths(due, 1) : addDays(due, 14);
        set((s) => ({
          bills: s.bills.map((b) =>
            b.id === id ? { ...b, nextDue: format(next, 'yyyy-MM-dd') } : b
          ),
        }));
      },

      addGoal: (g) =>
        set((s) => ({ goals: [...s.goals, { ...g, id: nanoid(), saved: 0 }] })),

      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      contributeToGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g
          ),
        })),

      getAllCategories: () => [...DEFAULT_CATEGORIES, ...get().customCategories],

      getCurrentPeriod: () => {
        const today = startOfDay(new Date());
        return (
          get().payPeriods.find((p) =>
            isWithinInterval(today, {
              start: startOfDay(parseISO(p.startDate)),
              end: startOfDay(parseISO(p.endDate)),
            })
          ) ?? null
        );
      },

      getPeriodTransactions: (periodId) =>
        get().transactions.filter((t) => t.payPeriodId === periodId),

      getCategorySpend: (periodId) => {
        const txns = get().transactions.filter(
          (t) =>
            t.type !== 'income' &&
            (periodId ? t.payPeriodId === periodId : true)
        );
        const result: BudgetMap = {};
        txns.forEach((t) => {
          result[t.category] = (result[t.category] ?? 0) + t.amount;
        });
        return result;
      },

      getPeriodIncome: (periodId) =>
        get()
          .transactions.filter(
            (t) =>
              t.type === 'income' &&
              (periodId ? t.payPeriodId === periodId : true)
          )
          .reduce((a, t) => a + t.amount, 0),
    }),
    {
      name: 'budget-store-v2',
      version: 1,
      migrate: (persisted: unknown) => {
        const s = (persisted ?? {}) as Record<string, unknown>;
        return {
          ...s,
          transactions: Array.isArray(s.transactions)
            ? (s.transactions as Array<Omit<Transaction, 'type'> & { type?: Transaction['type'] }>).map(
                (t) => ({ ...t, type: t.type ?? 'expense' })
              )
            : [],
          bills: Array.isArray(s.bills) ? s.bills : [],
          goals: Array.isArray(s.goals) ? s.goals : [],
        };
      },
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      skipHydration: true,
    }
  )
);
