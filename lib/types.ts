export type Category = string;

export type TxType = 'expense' | 'income';

export interface CategoryDef {
  id: string;
  label: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'phone_bills',     label: 'Phone Bills',    color: '#818cf8', icon: '📱', isDefault: true },
  { id: 'car_gas',         label: 'Car Gas',        color: '#fbbf24', icon: '⛽', isDefault: true },
  { id: 'car_insurance',   label: 'Car Insurance',  color: '#34d399', icon: '🛡️', isDefault: true },
  { id: 'investments',     label: 'Investments',    color: '#60a5fa', icon: '📈', isDefault: true },
  { id: 'loan_repayments', label: 'Loan Repayments',color: '#f87171', icon: '🏦', isDefault: true },
  { id: 'others',          label: 'Others',         color: '#a78bfa', icon: '📦', isDefault: true },
];

export const CATEGORY_COLORS = [
  '#818cf8', '#6366f1', '#8b5cf6', '#a78bfa',
  '#f472b6', '#ec4899',
  '#fb923c', '#f97316',
  '#fbbf24', '#f59e0b',
  '#34d399', '#10b981',
  '#60a5fa', '#3b82f6',
  '#f87171', '#ef4444',
  '#94a3b8', '#64748b',
];

export type BudgetMap = Record<string, number>;

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  payPeriodId: string;
  type: TxType;
}

export interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
}

export type BillFrequency = 'biweekly' | 'monthly';

export interface RecurringBill {
  id: string;
  label: string;
  amount: number;
  category: string;
  frequency: BillFrequency;
  nextDue: string; // yyyy-MM-dd
  autopay: boolean;
}

export interface Goal {
  id: string;
  label: string;
  icon: string;
  color: string;
  target: number;
  saved: number;
}
