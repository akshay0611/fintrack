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
import { Bell, CreditCard, Calendar, List, LineChart } from "lucide-react"
import { usePreferences } from "@/lib/preferences-context"
import { formatCurrency } from "@/lib/format-utils"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

// CSV conversion utility
const convertToCSV = (data: any[], headers: string[]) => {
  const csv = [
    headers.join(','),
    ...data.map(item => 
      headers.map(header => {
        const key = header.charAt(0).toLowerCase() + header.slice(1); // Convert to camelCase for consistency
        const value = item[key] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  return csv;
}

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

  const handleExportCSV = () => {
    if (!subscriptions.length) {
      alert('No subscription data to export')
      return
    }

    // Define CSV headers based on SubscriptionEntry properties
    const headers = ['Name', 'Amount', 'BillingCycle', 'StartDate', 'Status']

    // Format the subscription data
    const csvData = subscriptions.map((subscription) => ({
      name: subscription.name || '',
      amount: subscription.amount || 0,
      billingCycle: subscription.billingCycle || '',
      startDate: subscription.startDate ? new Date(subscription.startDate).toISOString().split('T')[0] : '',
      status: subscription.status || ''
    }))

    // Convert the data to CSV format
    const csvContent = convertToCSV(csvData, headers)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    // Set download attributes
    link.setAttribute('href', url)
    link.setAttribute('download', `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`)

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-background to-background/95">
        <div className="fixed left-0 top-0 h-screen w-12 border-r bg-card/50 backdrop-blur-sm">
          <SideNav />
        </div>
        <div className="flex-1 p-2">
          <Skeleton className="h-10 w-40 mb-4" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
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
      <div className="fixed left-0 top-0 h-screen w-12 border-r bg-card/50 backdrop-blur-sm">
        <SideNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-0 overflow-y-auto">
        {/* Header */}
        <div className="relative px-2 py-4">
          <h2 className="text-3xl font-bold tracking-tight text-primary animate-in slide-in-from-left duration-500">
            Subscriptions Dashboard
          </h2>
          <p className="text-muted-foreground mt-1 animate-in slide-in-from-left duration-500 delay-200">
            Managing subscriptions for {user.email}
          </p>
        </div>

        {/* Content Container */}
        <div className="px-2 py-4 max-w-3xl animate-in fade-in duration-700">
          {/* Stats Cards */}
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-4">
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
                <div className="text-2xl font-bold text-primary">{totalSubscriptions}</div>
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
                <div className="text-2xl font-bold text-primary">
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
                <div className="text-2xl font-bold text-primary">
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
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(yearlyActive, preferences.currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Yearly subscriptions cost</p>
              </CardContent>
            </Card>
          </div>

          {/* Subscriptions List */}
          <Card className="relative overflow-hidden border bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  Subscription List
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleExportCSV}
                  className="gap-2"
                  disabled={!subscriptions.length}
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