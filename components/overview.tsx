"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowDown, ArrowUp, CreditCard, PiggyBank, Wallet, WalletCards } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard-data";
import { usePreferences } from "@/lib/preferences-context";
import { formatCurrency } from "@/lib/format-utils";
import { create } from "zustand";
import { DateRangePicker } from "@/components/date-range-picker"; // Add this import
import { Reports } from "./reports";
import { RecentTransactions } from "@/components/recent-transactions";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AddExpenseDialog } from "../components/expenses/add-expense-dialog";
import { useState } from "react";

// Define the time period options
const timePeriodOptions = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "last7days" },
  { label: "Last 30 days", value: "last30days" },
  { label: "Month to Date", value: "monthToDate" },
  { label: "Year to Date", value: "yearToDate" },
];

interface DateRange {
  from: Date;
  to?: Date; // Optional 'to' date
}

interface DateRangeStore {
  dateRange: DateRange;
  timePeriod: string; // New field for time period
  setDateRange: (range: DateRange) => void;
  setTimePeriod: (period: string) => void; // New method to set time period
}

// Export useDateRangeStore
export const useDateRangeStore = create<DateRangeStore>((set) => ({
  dateRange: {
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  },
  timePeriod: "today", // Default time period
  setDateRange: (range: DateRange) => set({ dateRange: range }),
  setTimePeriod: (period: string) => set({ timePeriod: period }),
}));

export function Overview() {
  const { dateRange, timePeriod, setDateRange, setTimePeriod } = useDateRangeStore();
  const {
    totalIncome,
    totalExpenses,
    totalInvestments,
    monthlySubscriptionCost,
    availableBalance,
    totalSavings,
    yearlySubscriptionCost,
  } = useDashboardData(dateRange);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { preferences } = usePreferences();

  const effectiveMonthlyCost = monthlySubscriptionCost + (yearlySubscriptionCost / 12);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  // Function to update date range based on selected time period
  const updateDateRangeByPeriod = (period: string) => {
    const today = new Date();
    let from, to;

    switch (period) {
      case "today":
        from = new Date(today);
        to = new Date(today);
        break;
      case "last7days":
        from = new Date(today.setDate(today.getDate() - 7));
        to = new Date();
        break;
      case "last30days":
        from = new Date(today.setDate(today.getDate() - 30));
        to = new Date();
        break;
      case "monthToDate":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date();
        break;
      case "yearToDate":
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date();
        break;
      default:
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date();
    }

    setDateRange({ from, to });
    setTimePeriod(period);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-4">
          <DateRangePicker />
          <div className="relative">
            <select
              value={timePeriod}
              onChange={(e) => updateDateRangeByPeriod(e.target.value)}
               className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-[#09090b] text-gray-900 dark:text-white"
            >
              {timePeriodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card className="overflow-hidden border-l-4 border-l-primary transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Total Income</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowDown className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalIncome, preferences.currency)}</div>
              <p className="text-xs text-muted-foreground mt-1">All income in selected period</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-l-4 border-l-primary transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Available Balance</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${availableBalance < 0 ? "text-red-500" : ""}`}>
                {formatCurrency(availableBalance, preferences.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Current available funds</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-l-4 border-l-destructive transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Total Expenses</CardTitle>
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <ArrowUp className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalExpenses, preferences.currency)}</div>
              <p className="text-xs text-muted-foreground mt-1">All expenses in selected period</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Total Investment</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <PiggyBank className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalInvestments, preferences.currency)}</div>
              <p className="text-xs text-muted-foreground mt-1">All investments in selected period</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-l-4 border-l-orange-500 transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Effective Monthly Cost</CardTitle>
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(effectiveMonthlyCost, preferences.currency)}</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly + annualized yearly subscriptions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Total Savings</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <WalletCards className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${totalSavings < 0 ? "text-red-500" : "text-green-500"}`}>
                {formatCurrency(totalSavings, preferences.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total amount saved</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl border shadow-sm p-1"
        >
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Financial Reports</h2>
            <Reports dateRange={dateRange} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card rounded-xl border shadow-sm p-1"
        >
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <RecentTransactions dateRange={dateRange} />
          </div>
        </motion.div>
      </div>
      <div className="fixed bottom-8 right-8">
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add expense</span>
        </Button>
      </div>
      <AddExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}