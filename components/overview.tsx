"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, ArrowRightLeft, CreditCard, PiggyBank, Wallet, WalletCards, Plus, TrendingUp, RefreshCcw } from "lucide-react"
import { usePreferences } from "@/lib/preferences-context"
import { formatCurrency } from "@/lib/format-utils"
import { getTransactions } from "@/lib/actions/transactions"
import { DateRangePicker } from "@/components/date-range-picker"
import { Reports } from "./reports"
import { RecentTransactions } from "@/components/recent-transactions"
import { Button } from "@/components/ui/button"
import { AddIncomeDialog } from "../components/income/add-income-dialog"
import { AddExpenseDialog } from "../components/expenses/add-expense-dialog"
import { AddTransferDialog } from "../components/transfers/add-transfer-dialog"
import { useDateRangeStore } from "@/lib/hooks/use-date-range-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const timePeriodOptions = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "last7days" },
  { label: "Last 30 days", value: "last30days" },
  { label: "Month to Date", value: "monthToDate" },
  { label: "Year to Date", value: "yearToDate" },
]

interface DateRange { from: Date; to?: Date }

export function Overview() {
  const { dateRange, timePeriod, setDateRange, setTimePeriod, updateDateRangeByPeriod } = useDateRangeStore()
  const [transactions, setTransactions] = useState<any[]>([])
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false)
  const [isAddTransferOpen, setIsAddTransferOpen] = useState(false)
  const { preferences } = usePreferences()

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        if (!dateRange.from) return
        const result = await getTransactions()
        if (result.data) { setTransactions(result.data) }
      } catch (error) { console.error("Failed to fetch transactions:", error) }
    }
    loadTransactions()
    const onChanged = () => loadTransactions()
    window.addEventListener("fintrack:transactions-changed", onChanged)
    return () => window.removeEventListener("fintrack:transactions-changed", onChanged)
  }, [dateRange.from, dateRange.to])

  const filteredByDate = useMemo(() => {
    return transactions.filter((t: any) => {
      const tDate = new Date(t.transaction_date)
      return (!dateRange.from || tDate >= dateRange.from) && (!dateRange.to || tDate <= dateRange.to)
    })
  }, [transactions, dateRange])

  const totalIncome = filteredByDate.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0)
  const totalExpenses = filteredByDate.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0)
  const totalInvestments = filteredByDate.filter((t: any) => t.type === 'investment_buy').reduce((sum: number, t: any) => sum + t.amount, 0)
  const totalSavings = totalIncome - totalExpenses

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-4">
          <DateRangePicker />
          <div className="relative">
            <select value={timePeriod} onChange={(e) => updateDateRangeByPeriod(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-[#09090b] text-gray-900 dark:text-white">
              {timePeriodOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
            </select>
          </div>
        </div>
      </header>
      <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}>
        <motion.div><Card className="overflow-hidden border-l-4 border-l-primary"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-base font-semibold">Total Income</CardTitle><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><ArrowDown className="h-4 w-4 text-primary" /></div></CardHeader><CardContent><div className="text-3xl font-bold">{formatCurrency(totalIncome, preferences.currency)}</div><p className="text-xs text-muted-foreground mt-1">All income in selected period</p></CardContent></Card></motion.div>
        <motion.div><Card className="overflow-hidden border-l-4 border-l-primary"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-base font-semibold">Available Balance</CardTitle><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><Wallet className="h-4 w-4 text-primary" /></div></CardHeader><CardContent><div className={`text-3xl font-bold ${totalSavings < 0 ? "text-red-500" : ""}`}>{formatCurrency(totalSavings, preferences.currency)}</div><p className="text-xs text-muted-foreground mt-1">Current available funds</p></CardContent></Card></motion.div>
        <motion.div><Card className="overflow-hidden border-l-4 border-l-destructive"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-base font-semibold">Total Expenses</CardTitle><div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center"><ArrowUp className="h-4 w-4 text-destructive" /></div></CardHeader><CardContent><div className="text-3xl font-bold">{formatCurrency(totalExpenses, preferences.currency)}</div><p className="text-xs text-muted-foreground mt-1">All expenses in selected period</p></CardContent></Card></motion.div>
        <motion.div><Card className="overflow-hidden border-l-4 border-l-blue-500"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-base font-semibold">Total Investment</CardTitle><div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center"><PiggyBank className="h-4 w-4 text-blue-500" /></div></CardHeader><CardContent><div className="text-3xl font-bold">{formatCurrency(totalInvestments, preferences.currency)}</div><p className="text-xs text-muted-foreground mt-1">All investments in selected period</p></CardContent></Card></motion.div>
        <motion.div><Card className="overflow-hidden border-l-4 border-l-orange-500"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-base font-semibold">Effective Monthly Cost</CardTitle><div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center"><CreditCard className="h-4 w-4 text-orange-500" /></div></CardHeader><CardContent><div className="text-3xl font-bold">{formatCurrency(0, preferences.currency)}</div><p className="text-xs text-muted-foreground mt-1">Monthly + annualized yearly subscriptions</p></CardContent></Card></motion.div>
        <motion.div><Card className="overflow-hidden border-l-4 border-l-green-500"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-base font-semibold">Total Savings</CardTitle></CardHeader><CardContent><div className={`text-3xl font-bold ${totalSavings < 0 ? "text-red-500" : "text-green-500"}`}>{formatCurrency(totalSavings, preferences.currency)}</div><p className="text-xs text-muted-foreground mt-1">Total amount saved</p></CardContent></Card></motion.div>
      </motion.div>
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}><div className="bg-card rounded-xl border shadow-sm p-1"><div className="p-4"><h2 className="text-xl font-semibold mb-4">Financial Reports</h2><Reports dateRange={dateRange} /></div></div></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}><div className="bg-card rounded-xl border shadow-sm p-1"><div className="p-4"><h2 className="text-xl font-semibold mb-4">Recent Transactions</h2><RecentTransactions dateRange={dateRange} /></div></div></motion.div>
      </div>
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-8 sm:right-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="h-6 w-6" />
              <span className="sr-only">Add transaction</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setIsAddIncomeOpen(true)} className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Add Income</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddExpenseOpen(true)} className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 text-red-500" />
              <span>Add Expense</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddTransferOpen(true)} className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-blue-500" />
              <span>Add Transfer</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AddIncomeDialog open={isAddIncomeOpen} onOpenChange={setIsAddIncomeOpen} />
      <AddExpenseDialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen} />
      <AddTransferDialog open={isAddTransferOpen} onOpenChange={setIsAddTransferOpen} />
    </div>
  )
}