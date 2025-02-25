import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient() // Initialize Supabase client

export interface InvestmentEntry {
  id: string
  user_id: string
  amount: number
  name: string
  date: string
  units: number
  price: number
  category: string
  notes?: string
}

interface InvestmentStore {
  investments: InvestmentEntry[]
  addInvestment: (investment: Omit<InvestmentEntry, 'id'>, user_id: string) => Promise<void>
  editInvestment: (id: string, updatedInvestment: Omit<InvestmentEntry, 'id'>, user_id: string) => Promise<void>
  deleteInvestment: (id: string, user_id: string) => Promise<void>
  getTotalInvestments: (user_id: string) => number
  getInvestmentsByUser: (user_id: string) => InvestmentEntry[]
  fetchInvestments: (user_id: string) => Promise<void> // New method to fetch investments from Supabase
}

export const useInvestmentStore = create<InvestmentStore>()(
  persist(
    (set, get) => ({
      investments: [],
      // Add investment to Supabase and local state
      addInvestment: async (investment, user_id) => {
        const { data, error } = await supabase
          .from('investments')
          .insert([{ ...investment, user_id }])
          .select()

        if (error) {
          console.error('Error adding investment:', error)
          return
        }

        if (data) {
          set((state) => ({
            investments: [...state.investments, data[0]]
          }))
        }
      },
      // Edit investment in Supabase and local state
      editInvestment: async (id, updatedInvestment, user_id) => {
        const { data, error } = await supabase
          .from('investments')
          .update(updatedInvestment)
          .eq('id', id)
          .eq('user_id', user_id)
          .select()

        if (error) {
          console.error('Error editing investment:', error)
          return
        }

        if (data) {
          set((state) => ({
            investments: state.investments.map((investment) =>
              investment.id === id ? { ...investment, ...data[0] } : investment
            )
          }))
        }
      },
      // Delete investment from Supabase and local state
      deleteInvestment: async (id, user_id) => {
        const { error } = await supabase
          .from('investments')
          .delete()
          .eq('id', id)
          .eq('user_id', user_id)

        if (error) {
          console.error('Error deleting investment:', error)
          return
        }

        set((state) => ({
          investments: state.investments.filter(
            (investment) => investment.id !== id
          )
        }))
      },
      // Get total investments for a specific user (local state)
      getTotalInvestments: (user_id) => {
        return get().investments
          .filter((investment) => investment.user_id === user_id)
          .reduce((total, investment) => total + investment.amount, 0)
      },
      // Get all investments for a specific user (local state)
      getInvestmentsByUser: (user_id) => {
        return get().investments.filter(
          (investment) => investment.user_id === user_id
        )
      },
      // Fetch investments from Supabase and update local state
      fetchInvestments: async (user_id) => {
        const { data, error } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', user_id)

        if (error) {
          console.error('Error fetching investments:', error)
          return
        }

        if (data) {
          set({ investments: data })
        }
      }
    }),
    {
      name: 'investment-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)