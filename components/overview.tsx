"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee } from "lucide-react"
import { useDashboardData } from "@/lib/dashboard-data"
import { usePreferences } from "@/lib/preferences-context"
import { formatCurrency } from "@/lib/format-utils"
import { create } from "zustand"
import type { DateRange } from "react-day-picker"

interface DateRangeStore {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
}

const useDateRangeStore = create<DateRangeStore>((set) => ({
  dateRange: {
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  },
  setDateRange: (range: DateRange) => set({ dateRange: range }),
}))

export function Overview() {
  const { dateRange } = useDateRangeStore()
  const { totalIncome, totalExpenses, totalInvestments, monthlySubscriptionCost, availableBalance, totalSavings } =
    useDashboardData(dateRange)
  const { preferences } = usePreferences()

  return (
    <div>
       <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Total Income</CardTitle>
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalIncome, preferences.currency)}</div>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Available Balance</CardTitle>
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${availableBalance < 0 ? "text-red-500" : ""}`}>
              {formatCurrency(availableBalance, preferences.currency)}
            </div>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Total Expenses</CardTitle>
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalExpenses, preferences.currency)}</div>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Total Investment</CardTitle>
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalInvestments, preferences.currency)}</div>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Monthly Subscriptions</CardTitle>
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(monthlySubscriptionCost, preferences.currency)}</div>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Total Savings</CardTitle>
            <IndianRupee className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalSavings < 0 ? "text-red-500" : "text-green-500"}`}>
              {formatCurrency(totalSavings, preferences.currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Expenses by Category</h2>
        <p className="text-gray-600 text-lg">Breakdown of expenses for the selected date range.</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Recent Transactions</h2>
        <p className="text-gray-600 text-lg">You made 0 transactions recently.</p>
      </div>
    </div>
  )
}