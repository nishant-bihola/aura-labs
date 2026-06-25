export type Category =
  | 'phone_bills'
  | 'car_gas'
  | 'car_insurance'
  | 'investments'
  | 'loan_repayments'
  | 'others';

export interface CategoryInfo {
  label: string;
  color: string;
  icon: string;
}

export const CATEGORIES: Record<Category, CategoryInfo> = {
  phone_bills:    { label: 'Phone Bills',      color: '#818cf8', icon: '📱' },
  car_gas:        { label: 'Car Gas',           color: '#fbbf24', icon: '⛽' },
  car_insurance:  { label: 'Car Insurance',     color: '#34d399', icon: '🛡️' },
  investments:    { label: 'Investments',       color: '#60a5fa', icon: '📈' },
  loan_repayments:{ label: 'Loan Repayments',  color: '#f87171', icon: '🏦' },
  others:         { label: 'Others',            color: '#a78bfa', icon: '📦' },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

export type BudgetMap = Record<Category, number>;

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: Category;
  description: string;
  payPeriodId: string;
}

export interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
}
