'use client';

import PayPeriodBanner from '@/components/dashboard/PayPeriodBanner';
import SummaryCards from '@/components/dashboard/SummaryCards';
import CategoryRings from '@/components/dashboard/CategoryRings';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import HealthScore from '@/components/dashboard/HealthScore';
import SpendingInsights from '@/components/dashboard/SpendingInsights';
import SafeToSpend from '@/components/dashboard/SafeToSpend';
import UpcomingBills from '@/components/dashboard/UpcomingBills';
import Goals from '@/components/dashboard/Goals';

export default function Dashboard() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your biweekly financial overview</p>
      </div>

      <PayPeriodBanner />
      <SummaryCards />
      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <SafeToSpend />
        <UpcomingBills />
      </div>
      <SpendingInsights />
      <Goals />
      <HealthScore />
      <CategoryRings />
      <RecentTransactions />
    </div>
  );
}
