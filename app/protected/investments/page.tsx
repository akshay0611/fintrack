"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { InvestmentHistory } from "@/components/investments/investment-history";
import { Skeleton } from "@/components/ui/skeleton";
import { SideNav } from "@/components/side-nav";
import { useInvestmentStore } from "@/lib/investments-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-utils";
import { usePreferences } from "@/lib/preferences-context";
import { createClient } from "@/utils/supabase/client";
import { TrendingUp, ArrowUpRight, LineChart } from "lucide-react";

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


const supabase = createClient();

export default function InvestmentsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const totalInvestment = useInvestmentStore((state) => state.getTotalInvestments);
  const fetchInvestments = useInvestmentStore((state) => state.fetchInvestments);
  const investments = useInvestmentStore((state) => state.investments)
  const { preferences } = usePreferences();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchInvestments(userId);
    }
  }, [userId, fetchInvestments]);

  const handleExportCSV = () => {
    if (!investments.length) {
      alert('No investment data to export')
      return
    }
  
    // Define CSV headers based on InvestmentEntry properties
    const headers = ['Date', 'Name', 'Amount', 'Units', 'Price', 'Category', 'Notes']
  
    // Format the investment data
    const csvData = investments.map((investment) => ({
      date: new Date(investment.date).toISOString().split('T')[0], // Format date as YYYY-MM-DD
      name: investment.name,
      amount: investment.amount,
      units: investment.units,
      price: investment.price,
      category: investment.category,
      notes: investment.notes || '' // Handle optional notes
    }))
  
    // Convert the data to CSV format
    const csvContent = convertToCSV(csvData, headers)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
  
    // Set download attributes
    link.setAttribute('href', url)
    link.setAttribute('download', `investments-export-${new Date().toISOString().split('T')[0]}.csv`)
  
    // Trigger download
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
                Investment Dashboard
              </h2>
              <p className="text-muted-foreground mt-2 animate-in slide-in-from-left duration-500 delay-200">
                Track and optimize your investments
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-8 max-w-7xl animate-in fade-in duration-700">
          {/* Stats Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Total Investments */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Total Investments
                </CardTitle>
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary">
                  {userId ? formatCurrency(totalInvestment(userId), preferences.currency) : "Loading..."}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Your total invested amount</p>
              </CardContent>
            </Card>

            {/* Average Investments */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-primary" />
                  Average Investments
                </CardTitle>
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary">
                  {userId ? formatCurrency(totalInvestment(userId) / 12, preferences.currency) : "Loading..."}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Monthly investment trend</p>
              </CardContent>
            </Card>
          </div>

          {/* Investment History */}
          <Card className="relative overflow-hidden border bg-gradient-to-br from-card to-card/50">
            <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  Investments History
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleExportCSV}
                  className="gap-2"
                  disabled={!investments.length}
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
                <InvestmentHistory />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}