"use client";

import { useEffect } from "react";
import { Suspense } from "react";
import { IncomeHistory } from "@/components/income/income-history";
import { Skeleton } from "@/components/ui/skeleton";
import { SideNav } from "@/components/side-nav";
import { useIncomeStore } from "@/lib/income-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePreferences } from "@/lib/preferences-context";
import { formatCurrency } from "@/lib/format-utils";

export default function IncomePage() {
  // Get total income and the fetch function from the store
  const totalIncome = useIncomeStore((state) => state.getTotalIncome());
  const fetchIncomes = useIncomeStore((state) => state.fetchIncomes);
  const { preferences } = usePreferences();

  // Fetch incomes when the component mounts
  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  return (
    <div className="flex min-h-screen">
      <div className="fixed left-0 top-0 h-screen w-64">
        <SideNav />
      </div>
      <div className="flex-1">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Income</h2>
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold">
  {formatCurrency(totalIncome, preferences.currency)}
</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 grid-cols-12">
            <Suspense fallback={<Skeleton className="h-[450px] col-span-full" />}>
              <IncomeHistory />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}