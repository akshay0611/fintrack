"use client"

import { Suspense, useEffect, useState } from "react"
import { SubscriptionList } from "@/components/subscriptions/subscription-list"
import { Skeleton } from "@/components/ui/skeleton"
import { SideNav } from "@/components/side-nav"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { useSubscriptionStore } from "@/lib/subscriptions-data"

const supabase = createClient()

export default function SubscriptionsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { fetchSubscriptions } = useSubscriptionStore()

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      try {
        setIsLoading(true)
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          toast.error("Please log in to view your subscriptions")
          router.push('/login') // Redirect to login page if not authenticated
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

    // Set up real-time auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        fetchSubscriptions(session.user.id)
      }
    })

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, fetchSubscriptions])

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="fixed left-0 top-0 h-screen w-64">
          <SideNav />
        </div>
        <div className="flex-1">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-[450px] col-span-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // We'll redirect to login via the effect
  }

  return (
    <div className="flex min-h-screen">
      {/* Fixed Side Navigation */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <SideNav />
      </div>
      <div className="flex-1">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
            <p className="text-muted-foreground">
              Managing subscriptions for {user.email}
            </p>
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