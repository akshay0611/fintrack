"use client"

import { useEffect } from "react"
import { Suspense } from "react"
import { IncomeHistory } from "@/components/income/income-history"
import { Skeleton } from "@/components/ui/skeleton"
import { SideNav } from "@/components/side-nav"
import { useIncomeStore } from "@/lib/income-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePreferences } from "@/lib/preferences-context"
import { formatCurrency } from "@/lib/format-utils"
import { ArrowUpRight, DollarSign, LineChart, TrendingUp, Wallet } from "lucide-react"
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

export default function IncomePage() {
  const totalIncome = useIncomeStore((state) => state.getTotalIncome())
  const fetchIncomes = useIncomeStore((state) => state.fetchIncomes)
  const incomes = useIncomeStore((state) => state.incomes)
  const { preferences } = usePreferences()

  useEffect(() => {
    fetchIncomes()
  }, [fetchIncomes])

  const handleExportCSV = () => {
    if (!incomes.length) {
      alert('No income data to export')
      return
    }

    const headers = ['Date', 'Amount', 'Currency', 'Category', 'Description']
    const csvData = incomes.map(income => ({
      date: new Date(income.date).toISOString().split('T')[0],
      amount: income.amount,
      currency: preferences.currency,
      category: income.category,
      description: income.description || ''
    }))

    const csvContent = convertToCSV(csvData, headers)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `income-export-${new Date().toISOString().split('T')[0]}.csv`)
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
                Income Dashboard
              </h2>
              <p className="text-muted-foreground mt-2 animate-in slide-in-from-left duration-500 delay-200">
                Track your financial growth and income streams in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-6 py-8 max-w-7xl animate-in fade-in duration-700">
          {/* Stats Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Total Income Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  Total Income
                </CardTitle>
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(totalIncome, preferences.currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500 font-medium">Upward </span> trend
                </p>
              </CardContent>
            </Card>

            {/* Average Income Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-primary" />
                  Average Income
                </CardTitle>
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(totalIncome / 12, preferences.currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Monthly average</p>
              </CardContent>
            </Card>

            {/* Active Sources Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Active Sources
                </CardTitle>
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary">4</div>
                <p className="text-xs text-muted-foreground mt-1">Income streams</p>
              </CardContent>
            </Card>
          </div>

          {/* Income History */}
          <Card className="relative overflow-hidden border bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  Income History
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleExportCSV}
                  className="gap-2"
                  disabled={!incomes.length}
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
                <IncomeHistory />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}