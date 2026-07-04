'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, BarChart3, Wallet, Plus, Settings } from 'lucide-react';
import clsx from 'clsx';
import TransactionModal from '@/components/transactions/TransactionModal';

const NAV = [
  { href: '/',             label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/transactions', label: 'Activity',     Icon: ArrowLeftRight  },
  { href: '/budget',       label: 'Budget',       Icon: PiggyBank       },
  { href: '/analytics',   label: 'Analytics',    Icon: BarChart3       },
  { href: '/settings',     label: 'Settings',     Icon: Settings        },
];

export default function Navigation() {
  const path = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-40">
        <div className="flex items-center gap-3 p-6 border-b border-slate-800">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white tracking-tight">PayTrack</p>
            <p className="text-xs text-slate-400">Biweekly Budget</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all',
                path === href
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 space-y-3 border-t border-slate-800">
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Transaction
          </button>
          <p className="text-xs text-slate-600 text-center">All data stored locally</p>
        </div>
      </aside>

      {/* Mobile FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="md:hidden fixed z-50 bottom-[72px] right-4 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:scale-95 rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center transition-all"
        aria-label="Add transaction"
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 flex safe-bottom">
        {NAV.map(({ href, label, Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative"
            >
              {active && (
                <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-indigo-500 rounded-full" />
              )}
              <Icon
                size={20}
                className={clsx(
                  'transition-colors',
                  active ? 'text-indigo-400' : 'text-slate-500'
                )}
              />
              <span
                className={clsx(
                  'text-[10px] font-semibold transition-colors',
                  active ? 'text-indigo-400' : 'text-slate-500'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
