import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { addDays, format, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { Category, Transaction, BudgetMap, PayPeriod, CATEGORY_KEYS } from './types';

const DEFAULT_BUDGET: BudgetMap = {
  phone_bills: 100,
  car_gas: 150,
  car_insurance: 100,
  investments: 200,
  loan_repayments: 300,
  others: 100,
};

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

function makePayPeriods(firstPayDate: string, count = 52): PayPeriod[] {
  const periods: PayPeriod[] = [];
  let start = parseISO(firstPayDate);
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
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

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
      budget: DEFAULT_BUDGET,
      transactions: [],

      setPayAmount: (v) => set({ payAmount: v }),

      setFirstPayDate: (d) =>
        set({ firstPayDate: d, payPeriods: makePayPeriods(d) }),

      setBudget: (cat, v) =>
        set((s) => ({ budget: { ...s.budget, [cat]: v } })),

      addTransaction: (t) => {
        const { payPeriods } = get();
        const date = parseISO(t.date);
        const period = payPeriods.find((p) =>
          isWithinInterval(startOfDay(date), {
            start: startOfDay(parseISO(p.startDate)),
            end: startOfDay(parseISO(p.endDate)),
          })
        );
        set((s) => ({
          transactions: [
            { ...t, id: nanoid(), payPeriodId: period?.id ?? 'orphan' },
            ...s.transactions,
          ],
        }));
      },

      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        })),

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
