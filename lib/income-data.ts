import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface IncomeEntry {
  id: string
  amount: number
  category: string
  description: string
  date: string
}

interface IncomeStore {
  incomes: IncomeEntry[]
  addIncome: (income: Omit<IncomeEntry, 'id'>) => void
  editIncome: (id: string, updatedIncome: Omit<IncomeEntry, 'id'>) => void
  deleteIncome: (id: string) => void
  getTotalIncome: () => number
}

export const useIncomeStore = create<IncomeStore>()(
  persist(
    (set, get) => ({
      incomes: [],
      addIncome: (income) => set((state) => ({
        incomes: [...state.incomes, { ...income, id: Date.now().toString() }]
      })),
      editIncome: (id, updatedIncome) => set((state) => ({
        incomes: state.incomes.map((income) => 
          income.id === id ? { ...income, ...updatedIncome } : income
        )
      })),
      deleteIncome: (id) => set((state) => ({
        incomes: state.incomes.filter((income) => income.id !== id)
      })),
      getTotalIncome: () => {
        return get().incomes.reduce((total, income) => total + income.amount, 0)
      }
    }),
    {
      name: 'income-storage', // unique name for local storage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

