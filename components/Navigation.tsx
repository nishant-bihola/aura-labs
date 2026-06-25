'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, BarChart3, Wallet } from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { href: '/',             label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', Icon: ArrowLeftRight  },
  { href: '/budget',       label: 'Budget',       Icon: PiggyBank       },
  { href: '/analytics',   label: 'Analytics',    Icon: BarChart3       },
];

export default function Navigation() {
  const path = usePathname();

  return (
    <>
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

        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 text-center">All data stored locally</p>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 flex">
        {NAV.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              path === href ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
