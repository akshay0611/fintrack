import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface InvestmentEntry {
  id: string
  amount: number
  type: string
  name: string
  date: string
  units: number
  price: number
  category: string
  notes?: string
}

interface InvestmentStore {
  investments: InvestmentEntry[]
  addInvestment: (investment: Omit<InvestmentEntry, 'id'>) => void
  editInvestment: (id: string, updatedInvestment: Omit<InvestmentEntry, 'id'>) => void
  deleteInvestment: (id: string) => void
  getTotalInvestments: () => number
}

export const useInvestmentStore = create<InvestmentStore>()(
  persist(
    (set, get) => ({
      investments: [],
      addInvestment: (investment) => set((state) => ({
        investments: [...state.investments, { ...investment, id: Date.now().toString() }]
      })),
      editInvestment: (id, updatedInvestment) => set((state) => ({
        investments: state.investments.map((investment) => 
          investment.id === id ? { ...investment, ...updatedInvestment } : investment
        )
      })),
      deleteInvestment: (id) => set((state) => ({
        investments: state.investments.filter((investment) => investment.id !== id)
      })),
      getTotalInvestments: () => {
        return get().investments.reduce((total, investment) => total + investment.amount, 0)
      }
    }),
    {
      name: 'investment-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

