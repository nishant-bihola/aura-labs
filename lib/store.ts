import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { addDays, format, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { CategoryDef, DEFAULT_CATEGORIES, Transaction, BudgetMap, PayPeriod } from './types';

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

  setPayAmount: (v: number) => void;
  setFirstPayDate: (d: string) => void;
  setBudget: (cat: string, v: number) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'payPeriodId'>) => void;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id' | 'payPeriodId'>>) => void;
  deleteTransaction: (id: string) => void;
  clearAll: () => void;

  addCategory: (cat: Omit<CategoryDef, 'id' | 'isDefault'>) => void;
  updateCategory: (id: string, patch: Partial<Omit<CategoryDef, 'id' | 'isDefault'>>) => void;
  deleteCategory: (id: string) => void;

  getAllCategories: () => CategoryDef[];
  getCurrentPeriod: () => PayPeriod | null;
  getPeriodTransactions: (periodId: string) => Transaction[];
  getCategorySpend: (periodId?: string) => BudgetMap;
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

      clearAll: () =>
        set((s) => ({
          payAmount: 0,
          firstPayDate: format(new Date(), 'yyyy-MM-dd'),
          payPeriods: makePayPeriods(format(new Date(), 'yyyy-MM-dd')),
          budget: {},
          transactions: [],
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
        const txns = periodId
          ? get().transactions.filter((t) => t.payPeriodId === periodId)
          : get().transactions;
        const result: BudgetMap = {};
        txns.forEach((t) => {
          result[t.category] = (result[t.category] ?? 0) + t.amount;
        });
        return result;
      },
    }),
    {
      name: 'budget-store-v2',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      skipHydration: true,
    }
  )
);
