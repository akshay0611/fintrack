

import { Suspense } from "react"
import { SubscriptionList } from "@/components/subscriptions/subscription-list"
import { Skeleton } from "@/components/ui/skeleton"
import { SideNav } from "@/components/side-nav"

export default function SubscriptionsPage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex-1">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
          </div>
          <div className="grid gap-4 grid-cols-12">
            <Suspense fallback={<Skeleton className="h-[450px] col-span-full" />}>
              <SubscriptionList />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

