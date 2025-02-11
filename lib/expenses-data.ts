import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface ExpenseEntry {
  id: string
  amount: number
  category: string
  description: string
  date: string
  paidVia: string
}

interface ExpenseStore {
  expenses: ExpenseEntry[]
  addExpense: (expense: Omit<ExpenseEntry, 'id'>) => void
  editExpense: (id: string, updatedExpense: Omit<ExpenseEntry, 'id'>) => void
  deleteExpense: (id: string) => void
  getTotalExpenses: () => number
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],
      addExpense: (expense) => set((state) => ({
        expenses: [...state.expenses, { ...expense, id: Date.now().toString() }]
      })),
      editExpense: (id, updatedExpense) => set((state) => ({
        expenses: state.expenses.map((expense) => 
          expense.id === id ? { ...expense, ...updatedExpense } : expense
        )
      })),
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((expense) => expense.id !== id)
      })),
      getTotalExpenses: () => {
        return get().expenses.reduce((total, expense) => total + expense.amount, 0)
      }
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

