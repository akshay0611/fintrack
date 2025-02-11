import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface SubscriptionEntry {
  id: string
  name: string
  amount: number
  billingCycle: string
  startDate: string
  status: 'active' | 'cancelled'; // Add the status property here.
}

interface SubscriptionStore {
  subscriptions: SubscriptionEntry[]
  addSubscription: (subscription: Omit<SubscriptionEntry, 'id'>) => void
  editSubscription: (id: string, updatedSubscription: Omit<SubscriptionEntry, 'id'>) => void
  deleteSubscription: (id: string) => void
  getTotalSubscriptions: () => number
  getMonthlySubscriptionCost: () => number
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      addSubscription: (subscription) => set((state) => ({
        subscriptions: [...state.subscriptions, { ...subscription, id: Date.now().toString() }]
      })),
      editSubscription: (id, updatedSubscription) => set((state) => ({
        subscriptions: state.subscriptions.map((subscription) => 
          subscription.id === id ? { ...subscription, ...updatedSubscription } : subscription
        )
      })),
      deleteSubscription: (id) => set((state) => ({
        subscriptions: state.subscriptions.filter((subscription) => subscription.id !== id)
      })),
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

