import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export interface SubscriptionEntry {
  id: string
  user_id: string // Added user_id
  name: string
  amount: number
  billingCycle: string
  startDate: string
  status: 'active' | 'cancelled'
}

interface SubscriptionStore {
  subscriptions: SubscriptionEntry[]
  addSubscription: (subscription: Omit<SubscriptionEntry, 'id' | 'user_id'> & { user_id?: string }) => Promise<void>
  editSubscription: (id: string, updatedSubscription: Omit<SubscriptionEntry, 'id' | 'user_id'>) => Promise<void>
  deleteSubscription: (id: string) => Promise<void>
  fetchSubscriptions: (userId: string) => Promise<void>
  getTotalSubscriptions: () => number
  getMonthlySubscriptionCost: () => number
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      
      addSubscription: async (subscription) => {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = subscription.user_id || user?.id
        
        if (!userId) throw new Error('No user ID available')

        const newSubscription = {
          ...subscription,
          user_id: userId,
        }

        const { data, error } = await supabase
          .from('subscriptions')
          .insert(newSubscription)
          .select()
          .single()

        if (error) throw error

        set((state) => ({
          subscriptions: [...state.subscriptions, data]
        }))
      },

      editSubscription: async (id, updatedSubscription) => {
        const { data, error } = await supabase
          .from('subscriptions')
          .update(updatedSubscription)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) =>
            subscription.id === id ? data : subscription
          )
        }))
      },

      deleteSubscription: async (id) => {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('id', id)

        if (error) throw error

        set((state) => ({
          subscriptions: state.subscriptions.filter((subscription) => subscription.id !== id)
        }))
      },

      fetchSubscriptions: async (userId) => {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)

        if (error) throw error

        set({ subscriptions: data || [] })
      },

      getTotalSubscriptions: () => {
        return get().subscriptions.length
      },

      getMonthlySubscriptionCost: () => {
        return get().subscriptions.reduce((total, subscription) => {
          switch (subscription.billingCycle) {
            case 'monthly':
              return total + subscription.amount
            case 'quarterly':
              return total + (subscription.amount / 3)
            case 'yearly':
              return total + (subscription.amount / 12)
            default:
              return total
          }
        }, 0)
      }
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)