"use client"

import { Suspense, useEffect, useState } from "react"
import { SubscriptionList } from "@/components/subscriptions/subscription-list"
import { Skeleton } from "@/components/ui/skeleton"
import { SideNav } from "@/components/side-nav"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { useSubscriptionStore } from "@/lib/subscriptions-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CreditCard, Calendar, List } from "lucide-react"
import { usePreferences } from "@/lib/preferences-context"
import { formatCurrency } from "@/lib/format-utils"

const supabase = createClient()

export default function SubscriptionsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { fetchSubscriptions, subscriptions } = useSubscriptionStore()
  const { preferences } = usePreferences()

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      try {
        setIsLoading(true)
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          toast.error("Please log in to view your subscriptions")
          router.push('/login')
          return
        }

        setUser(user)
        await fetchSubscriptions(user.id)
      } catch (error) {
        console.error('Error checking user:', error)
        toast.error("An error occurred while loading your subscriptions")
      } finally {
        setIsLoading(false)
      }
    }

    checkUserAndLoadData()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        fetchSubscriptions(session.user.id)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, fetchSubscriptions])

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-background to-background/95">
        <div className="fixed left-0 top-0 h-screen w-16 border-r bg-card/50 backdrop-blur-sm">
          <SideNav />
        </div>
        <div className="flex-1 ml-16 p-6">
          <Skeleton className="h-12 w-48 mb-8" />
          <Skeleton className="h-[450px] w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Calculate subscription metrics
  const totalSubscriptions = subscriptions.length
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length
  const cancelledSubscriptions = totalSubscriptions - activeSubscriptions
  const monthlyActive = subscriptions.filter(sub => 
    sub.status === 'active' && sub.billingCycle === 'monthly'
  ).reduce((sum, sub) => sum + (sub.amount || 0), 0)
  const yearlyActive = subscriptions.filter(sub => 
    sub.status === 'active' && sub.billingCycle === 'yearly'
  ).reduce((sum, sub) => sum + (sub.amount || 0), 0)

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
                Subscriptions Dashboard
              </h2>
              <p className="text-muted-foreground mt-2 animate-in slide-in-from-left duration-500 delay-200">
                Managing subscriptions for {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-6 py-8 max-w-7xl animate-in fade-in duration-700">
          {/* Stats Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Total Subscriptions Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <List className="w-4 h-4 text-primary" />
                  Total Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary">{totalSubscriptions}</div>
                <p className="text-xs text-muted-foreground mt-1">All subscriptions ever</p>
              </CardContent>
            </Card>

            {/* Active - Cancelled Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Active - Cancelled
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary">
                  {activeSubscriptions} - {cancelledSubscriptions}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Current status split</p>
              </CardContent>
            </Card>

            {/* Total Active - Monthly Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Total Active - Monthly
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(monthlyActive, preferences.currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Monthly subscriptions cost</p>
              </CardContent>
            </Card>

            {/* Total Active - Yearly Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Total Active - Yearly
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(yearlyActive, preferences.currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Yearly subscriptions cost</p>
              </CardContent>
            </Card>
          </div>

          {/* Subscriptions List */}
          <Card className="relative overflow-hidden border bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Subscription List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-[400px] w-full rounded-lg" />
                  </div>
                }
              >
                <SubscriptionList />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}