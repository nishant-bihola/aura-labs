'use client';

import PayPeriodBanner from '@/components/dashboard/PayPeriodBanner';
import SummaryCards from '@/components/dashboard/SummaryCards';
import CategoryRings from '@/components/dashboard/CategoryRings';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

export default function Dashboard() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your biweekly financial overview</p>
      </div>

      <PayPeriodBanner />
      <SummaryCards />
      <CategoryRings />
      <RecentTransactions />
    </div>
  );
}
