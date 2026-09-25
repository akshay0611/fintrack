"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { IncomeHistory } from "@/components/income/income-history";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePreferences } from "@/lib/preferences-context";
import { formatCurrency } from "@/lib/format-utils";
import { ArrowUpRight, LineChart, TrendingUp, Wallet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTransactions } from "@/lib/actions/transactions";
import { toCsv, downloadCsv } from "@/lib/csv-utils";

export default function IncomePage() {
  const { preferences } = usePreferences();
  const [incomes, setIncomes] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getTransactions();
        if (result.data) setIncomes(result.data.filter((t: any) => t.type === 'income'));
      } catch { }
    };
    load();
  }, []);

  const totalIncome = incomes.reduce((sum: number, i: any) => sum + i.amount, 0);

  const handleExportCSV = () => {
    if (!incomes.length) { alert('No income data to export'); return; }
    const rows = incomes.map((i: any) => [i.transaction_date, i.amount, i.category_name || i.category || "", i.description]);
    downloadCsv(`income-export-${new Date().toISOString().split('T')[0]}.csv`, toCsv(['Date', 'Amount', 'Category', 'Description'], rows));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background blur-3xl" />
        <div className="relative border-b bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-8">
            <h2 className="text-4xl font-bold tracking-tight text-primary animate-in slide-in-from-left duration-500">Income Dashboard</h2>
            <p className="text-muted-foreground mt-2 animate-in slide-in-from-left duration-500 delay-200">Track your financial growth and income streams in real-time</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8 max-w-7xl animate-in fade-in duration-700">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1 border-l-4 border-l-primary"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" />Total Income</CardTitle><ArrowUpRight className="w-4 h-4 text-primary" /></CardHeader><CardContent className="relative"><div className="text-3xl font-bold text-primary">{formatCurrency(totalIncome, preferences.currency)}</div><p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-500" /><span className="text-green-500 font-medium">Upward trend</span></p></CardContent></Card>
          <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><LineChart className="w-4 h-4 text-primary" />Average Income</CardTitle><ArrowUpRight className="w-4 h-4 text-primary" /></CardHeader><CardContent className="relative"><div className="text-3xl font-bold text-primary">{formatCurrency(totalIncome / 12, preferences.currency)}</div><p className="text-xs text-muted-foreground mt-1">Monthly average</p></CardContent></Card>
        </div>
        <Card className="relative overflow-hidden border bg-gradient-to-br from-card to-card/50">
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg font-semibold flex items-center gap-2"><LineChart className="w-5 h-5 text-primary" />Income History</CardTitle><Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-2" disabled={!incomes.length}><FileText className="w-4 h-4" />Export to CSV</Button></div></CardHeader>
          <CardContent><Suspense fallback={<div className="space-y-4"><Skeleton className="h-[400px] w-full rounded-lg" /><div className="grid grid-cols-3 gap-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div></div>}><IncomeHistory /></Suspense></CardContent>
        </Card>
      </div>
    </div>
  );
}