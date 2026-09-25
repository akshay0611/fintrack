"use client"

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { SubscriptionList } from "@/components/subscriptions/subscription-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CreditCard, Calendar, List, LineChart } from "lucide-react";
import { usePreferences } from "@/lib/preferences-context";
import { formatCurrency } from "@/lib/format-utils";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { getSubscriptions } from "@/lib/actions/subscriptions-v2";
import { toCsv, downloadCsv } from "@/lib/csv-utils";

export default function SubscriptionsPage() {
  const { preferences } = usePreferences();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const loadSubscriptions = async () => {
    try {
      const result = await getSubscriptions();
      if (result.data) setSubscriptions(result.data);
    } catch { }
  };

  useEffect(() => {
    loadSubscriptions();
    const onChanged = () => loadSubscriptions();
    window.addEventListener("fintrack:subscriptions-changed", onChanged);
    return () => window.removeEventListener("fintrack:subscriptions-changed", onChanged);
  }, []);

  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active').length;
  const cancelledSubscriptions = totalSubscriptions - activeSubscriptions;
  const monthlyActive = subscriptions.filter((s: any) => s.status === 'active' && s.cycle === 'monthly').reduce((sum: number, s: any) => sum + s.amount, 0);
  const yearlyActive = subscriptions.filter((s: any) => s.status === 'active' && s.cycle === 'yearly').reduce((sum: number, s: any) => sum + s.amount, 0);

  const handleExportCSV = () => {
    if (!subscriptions.length) { alert('No subscription data to export'); return; }
    const rows = subscriptions.map((s: any) => [s.name, s.amount, s.cycle, s.start_date, s.status]);
    downloadCsv(`subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`, toCsv(['Name', 'Amount', 'Cycle', 'StartDate', 'Status'], rows));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="relative px-2 py-4"><h2 className="text-3xl font-bold tracking-tight text-primary animate-in slide-in-from-left duration-500">Subscriptions Dashboard</h2><p className="text-muted-foreground mt-1 animate-in slide-in-from-left duration-500 delay-200">Managing subscriptions</p></div>
      <div className="px-2 py-4 max-w-3xl animate-in fade-in duration-700">
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><List className="w-4 h-4 text-primary" />Total Subscriptions</CardTitle></CardHeader><CardContent className="relative"><div className="text-2xl font-bold text-primary">{totalSubscriptions}</div><p className="text-xs text-muted-foreground mt-1">All subscriptions</p></CardContent></Card>
          <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Bell className="w-4 h-4 text-primary" />Active - Cancelled</CardTitle></CardHeader><CardContent className="relative"><div className="text-2xl font-bold text-primary">{activeSubscriptions} - {cancelledSubscriptions}</div><p className="text-xs text-muted-foreground mt-1">Current status split</p></CardContent></Card>
          <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Total Active - Monthly</CardTitle></CardHeader><CardContent className="relative"><div className="text-2xl font-bold text-primary">{formatCurrency(monthlyActive, preferences.currency)}</div><p className="text-xs text-muted-foreground mt-1">Monthly subscriptions cost</p></CardContent></Card>
          <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" />Total Active - Yearly</CardTitle></CardHeader><CardContent className="relative"><div className="text-2xl font-bold text-primary">{formatCurrency(yearlyActive, preferences.currency)}</div><p className="text-xs text-muted-foreground mt-1">Yearly subscriptions cost</p></CardContent></Card>
        </div>
        <Card className="relative overflow-hidden border bg-gradient-to-br from-card to-card/50">
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg font-semibold flex items-center gap-2"><LineChart className="w-5 h-5 text-primary" />Subscription List</CardTitle><Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-2" disabled={!subscriptions.length}><FileText className="w-4 h-4" />Export to CSV</Button></div></CardHeader>
          <CardContent><Suspense fallback={<div className="space-y-4"><Skeleton className="h-[400px] w-full rounded-lg" /></div>}><SubscriptionList /></Suspense></CardContent>
        </Card>
      </div>
    </div>
  );
}