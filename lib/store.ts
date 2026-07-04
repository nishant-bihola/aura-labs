import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { addDays, format, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { Category, Transaction, BudgetMap, PayPeriod, CATEGORY_KEYS } from './types';

const ZERO_BUDGET: BudgetMap = {
  phone_bills: 0,
  car_gas: 0,
  car_insurance: 0,
  investments: 0,
  loan_repayments: 0,
  others: 0,
};

function nanoid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makePayPeriods(firstPayDate: string, count = 104): PayPeriod[] {
  const periods: PayPeriod[] = [];
  let start = parseISO(firstPayDate);
  // Include 52 periods before the first pay date for historical entries
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

  setPayAmount: (v: number) => void;
  setFirstPayDate: (d: string) => void;
  setBudget: (cat: Category, v: number) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'payPeriodId'>) => void;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id' | 'payPeriodId'>>) => void;
  deleteTransaction: (id: string) => void;
  clearAll: () => void;

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
      budget: { ...ZERO_BUDGET },
      transactions: [],

      setPayAmount: (v) => set({ payAmount: v }),

      setFirstPayDate: (d) => {
        const newPeriods = makePayPeriods(d);
        set((s) => ({
          firstPayDate: d,
          payPeriods: newPeriods,
          // Re-assign every transaction to the correct period in the new schedule
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
          // Recalculate period assignment when date changes
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
        set({
          payAmount: 0,
          firstPayDate: format(new Date(), 'yyyy-MM-dd'),
          payPeriods: makePayPeriods(format(new Date(), 'yyyy-MM-dd')),
          budget: { ...ZERO_BUDGET },
          transactions: [],
        }),

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
        const result = { ...ZERO_BUDGET };
        txns.forEach((t) => {
          result[t.category] = (result[t.category] ?? 0) + t.amount;
        });
        return result;
      },
    }),
    {
      name: 'budget-store-v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      skipHydration: true,
    }
  )
);
