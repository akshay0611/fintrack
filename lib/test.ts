import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client'; // Ensure correct import path

const supabase = createClient();

export interface ExpenseEntry {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paidVia: string;
  created_at: string;
}

interface ExpenseStore {
  expenses: ExpenseEntry[];
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Omit<ExpenseEntry, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  editExpense: (id: string, updatedExpense: Omit<ExpenseEntry, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getTotalExpenses: () => number;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],

      // Fetch expenses from Supabase
      fetchExpenses: async () => {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', (await supabase.auth.getUser()).data?.user?.id || ''); // Fetch only the authenticated user's expenses

        if (error) {
          console.error('Error fetching expenses:', error.message);
          return;
        }

        set({ expenses: data });
      },

      // Add a new expense to Supabase
      addExpense: async (expense) => {
        const user = (await supabase.auth.getUser()).data?.user;
        if (!user) {
          console.error('Error: User not authenticated');
          return;
        }

        const { data, error } = await supabase
          .from('expenses')
          .insert([{ ...expense, user_id: user.id }])
          .select('*')
          .single(); // Fetch inserted record

        if (error) {
          console.error('Error adding expense:', error.message);
          return;
        }

        set((state) => ({ expenses: [...state.expenses, data] }));
      },

      // Edit an existing expense in Supabase
      editExpense: async (id, updatedExpense) => {
        const { data, error } = await supabase
          .from('expenses')
          .update(updatedExpense)
          .eq('id', id)
          .select('*')
          .single();

        if (error) {
          console.error('Error updating expense:', error.message);
          return;
        }

        set((state) => ({
          expenses: state.expenses.map((expense) => (expense.id === id ? data : expense)),
        }));
      },

      // Delete an expense from Supabase
      deleteExpense: async (id) => {
        const { error } = await supabase.from('expenses').delete().eq('id', id);

        if (error) {
          console.error('Error deleting expense:', error.message);
          return;
        }

        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },

      // Compute total expenses
      getTotalExpenses: () => {
        return get().expenses.reduce((total, expense) => total + expense.amount, 0);
      },
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);