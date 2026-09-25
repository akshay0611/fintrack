"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { InvestmentHistory } from "@/components/investments/investment-history";
import { Skeleton } from "@/components/ui/skeleton";
import { SideNav } from "@/components/side-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-utils";
import { usePreferences } from "@/lib/preferences-context";
import { TrendingUp, ArrowUpRight, LineChart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInvestmentHoldings } from "@/lib/actions/investments";

const convertToCSV = (data: any[], headers: string[]) => {
  const rows = data.map(item => headers.map(h => `"${String(item[h] || '').replace(/"/g, '""')}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
};

export default function InvestmentsPage() {
  const { preferences } = usePreferences();
  const [investments, setInvestments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getInvestmentHoldings();
        if (result.data) setInvestments(result.data);
      } catch { }
    };
    load();
  }, []);

  const totalInvestment = investments.reduce((sum: number, i: any) => sum + i.amount, 0);

  const handleExportCSV = () => {
    if (!investments.length) { alert('No investment data to export'); return; }
    const csvContent = convertToCSV(investments, ['Date', 'Name', 'Amount', 'Units', 'Category', 'Notes']);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `investments-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="fixed left-0 top-0 h-screen w-16 border-r bg-card/50 backdrop-blur-sm"><SideNav /></div>
      <div className="flex-1 ml-16 overflow-y-auto w-[calc(100%-4rem)]">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background blur-3xl" />
          <div className="relative border-b bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-8">
              <h2 className="text-4xl font-bold tracking-tight text-primary animate-in slide-in-from-left duration-500">Investment Dashboard</h2>
              <p className="text-muted-foreground mt-2 animate-in slide-in-from-left duration-500 delay-200">Track and optimize your investments</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8 max-w-7xl animate-in fade-in duration-700">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1 border-l-4 border-l-blue-500"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Total Investments</CardTitle><ArrowUpRight className="w-4 h-4 text-primary" /></CardHeader><CardContent className="relative"><div className="text-3xl font-bold text-primary">{formatCurrency(totalInvestment, preferences.currency)}</div><p className="text-xs text-muted-foreground mt-1">Your total invested amount</p></CardContent></Card>
          </div>
          <Card className="relative overflow-hidden border bg-gradient-to-br from-card to-card/50">
            <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg font-semibold flex items-center gap-2"><LineChart className="w-5 h-5 text-primary" />Investments History</CardTitle><Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-2" disabled={!investments.length}><FileText className="w-4 h-4" />Export to CSV</Button></div></CardHeader>
            <CardContent><Suspense fallback={<div className="space-y-4"><Skeleton className="h-[400px] w-full rounded-lg" /></div>}><InvestmentHistory /></Suspense></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}