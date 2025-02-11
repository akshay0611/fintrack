import { Suspense } from "react"
import { SideNav } from "@/components/side-nav"
import SettingsTabs from "@/components/settings/settings-tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex-1">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          </div>
          <Suspense fallback={<Skeleton className="h-[450px]" />}>
            <SettingsTabs />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

