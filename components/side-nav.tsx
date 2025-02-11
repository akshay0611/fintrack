// components/side-nav.tsx

import Link from "next/link";
import { IndianRupee, PieChart, RefreshCcw, CreditCard, Settings, HelpCircle } from 'lucide-react';

export function SideNav() {
  return (
    <div className="h-full border-r w-64">
      <div className="p-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            FinTrack
          </h2>
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50"
            >
              <IndianRupee className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/protected/income"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <PieChart className="h-4 w-4" />
              Income
            </Link>
            <Link
              href="/protected/expenses"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Expenses
            </Link>
            <Link
              href="/investments"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <CreditCard className="h-4 w-4" />
              Investments
            </Link>
            <Link
              href="/subscriptions"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <CreditCard className="h-4 w-4" />
              Subscriptions
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link
              href="/protected/help"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}