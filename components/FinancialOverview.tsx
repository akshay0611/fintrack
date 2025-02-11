"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard-data";
import { usePreferences } from "@/lib/preferences-context";
import { formatCurrency } from "@/lib/format-utils";
import { create } from "zustand";
import type { DateRange } from "react-day-picker";

interface DateRangeStore {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const useDateRangeStore = create<DateRangeStore>((set) => ({
  dateRange: {
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  },
  setDateRange: (range: DateRange) => set({ dateRange: range }),
}));

export function FinancialOverview() {
  const { dateRange } = useDateRangeStore();
  const { totalIncome, totalExpenses, totalInvestments, monthlySubscriptionCost, availableBalance, totalSavings } =
    useDashboardData(dateRange);
  const { preferences } = usePreferences();

  return (
    <div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome, preferences.currency)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${availableBalance < 0 ? "text-red-500" : ""}`}>
              {formatCurrency(availableBalance, preferences.currency)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses, preferences.currency)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestments, preferences.currency)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Subscriptions</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlySubscriptionCost, preferences.currency)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalSavings < 0 ? "text-red-500" : "text-green-500"}`}>
              {formatCurrency(totalSavings, preferences.currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Expenses by Category</h2>
        <p className="text-gray-600">Breakdown of expenses for the selected date range.</p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
        <p className="text-gray-600">You made 0 transactions recently.</p>
      </div>
    </div>
  );
}