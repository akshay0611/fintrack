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

const supabase = createClient();

export default function InvestmentsPage() {
  const [userId, setUserId] = useState<string | null>(null);

  const totalInvestment = useInvestmentStore((state) => state.getTotalInvestments);
  const fetchInvestments = useInvestmentStore((state) => state.fetchInvestments);
  const { preferences } = usePreferences();

  // Fetch user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Fetch investments when userId is available
  useEffect(() => {
    if (userId) {
      fetchInvestments(userId);
    }
  }, [userId, fetchInvestments]);

  return (
    <div className="flex min-h-screen">
      <div className="fixed left-0 top-0 h-screen w-64">
        <SideNav />
      </div>
      <div className="flex-1 ml-64">
        <div className="p-4 md:p-8 pt-6">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Investments</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userId ? formatCurrency(totalInvestment(userId), preferences.currency) : "Loading..."}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 grid-cols-12">
            <Suspense fallback={<Skeleton className="h-[450px] col-span-full" />}>
              <InvestmentHistory />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}