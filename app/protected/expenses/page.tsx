"use client";

import { useEffect } from "react";
import { Suspense } from "react";
import { ExpenseHistory } from "@/components/expenses/expense-history";
import { Skeleton } from "@/components/ui/skeleton";
import { SideNav } from "@/components/side-nav";
import { useExpenseStore } from "@/lib/expenses-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePreferences } from "@/lib/preferences-context";
import { formatCurrency } from "@/lib/format-utils";
import { ArrowUpRight, CreditCard, LineChart, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

// CSV conversion utility
const convertToCSV = (data: any[], headers: string[]) => {
  const csv = [
    headers.join(','),
    ...data.map(item => 
      headers.map(header => {
        const key = header.toLowerCase()
        const value = item[key] || ''
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(',')
    )
  ].join('\n')
  
  return csv
}

export default function ExpensePage() {
  const totalExpenses = useExpenseStore((state) => state.getTotalExpenses());
  const fetchExpenses = useExpenseStore((state) => state.fetchExpenses);
  const expenses = useExpenseStore((state) => state.expenses)
  const { preferences } = usePreferences();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleExportCSV = () => {
    if (!expenses.length) {
      alert('No expenses data to export')
      return
    }

    const headers = ['Date', 'Amount', 'Currency', 'Category', 'Description']
    const csvData = expenses.map(expenses => ({
      date: new Date(expenses.date).toISOString().split('T')[0],
      amount: expenses.amount,
      currency: preferences.currency,
      category: expenses.category,
      description: expenses.description || ''
    }))

    const csvContent = convertToCSV(csvData, headers)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `expenses-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-16 border-r bg-card/50 backdrop-blur-sm">
        <SideNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-16 overflow-y-auto w-[calc(100%-4rem)]">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background blur-3xl" />
          <div className="relative border-b bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-8">
              <h2 className="text-4xl font-bold tracking-tight text-primary animate-in slide-in-from-left duration-500">
                Expense Dashboard
              </h2>
              <p className="text-muted-foreground mt-2 animate-in slide-in-from-left duration-500 delay-200">
                Monitor and manage your spending effectively
              </p>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-6 py-8 max-w-7xl animate-in fade-in duration-700">
          {/* Stats Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Total Expenses Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Total Expenses
                </CardTitle>
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(totalExpenses, preferences.currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-primary" />
                  <span className="text-primary font-medium">Steady spending</span>
                </p>
              </CardContent>
            </Card>

            {/* Average Expenses Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-primary" />
                  Average Expenses
                </CardTitle>
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(totalExpenses / 12, preferences.currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Monthly average</p>
              </CardContent>
            </Card>
          </div>

          {/* Expense History */}
          <Card className="relative overflow-hidden border bg-gradient-to-br from-card to-card/50">
            <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  Expense History
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleExportCSV}
                  className="gap-2"
                  disabled={!expenses.length}
                >
                  <FileText className="w-4 h-4" />
                  Export to CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-[400px] w-full rounded-lg" />
                    <div className="grid grid-cols-3 gap-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                }
              >
                <ExpenseHistory />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}