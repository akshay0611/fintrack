import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client'; // Updated import path

// Create a supabase instance using your createClient function
const supabase = createClient();

export interface IncomeEntry {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface IncomeStore {
  incomes: IncomeEntry[];
  fetchIncomes: () => Promise<void>;
  addIncome: (income: Omit<IncomeEntry, 'id'>) => Promise<void>;
  editIncome: (id: string, updatedIncome: Omit<IncomeEntry, 'id'>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  getTotalIncome: () => number;
}

export const useIncomeStore = create<IncomeStore>()(
  persist(
    (set, get) => ({
      incomes: [],

      // Fetch incomes from Supabase
      fetchIncomes: async () => {
        const { data, error } = await supabase.from('income').select('*');
        if (error) {
          console.error('Error fetching incomes:', error.message);
          return;
        }
        set({ incomes: data });
      },

      // Add new income to Supabase
      addIncome: async (income) => {
        const { data: { user } } = await supabase.auth.getUser();
      
        if (!user) {
          console.error('User not authenticated');
          return;
        }
      
        const { data, error } = await supabase
          .from('income')
          .insert([{ ...income, user_id: user.id }]) // Add user_id here
          .select('*')
          .single();
      
        if (error) {
          console.error('Error adding income:', error.message);
          return;
        }
      
        set((state) => ({ incomes: [...state.incomes, data] }));
      },
      

      // Edit existing income entry in Supabase
      editIncome: async (id, updatedIncome) => {
        const { data, error } = await supabase
          .from('income')
          .update(updatedIncome)
          .eq('id', id)
          .select('*')
          .single();

        if (error) {
          console.error('Error updating income:', error.message);
          return;
        }

        set((state) => ({
          incomes: state.incomes.map((income) => (income.id === id ? data : income)),
        }));
      },

      // Delete income from Supabase
      deleteIncome: async (id) => {
        const { error } = await supabase.from('income').delete().eq('id', id);
        if (error) {
          console.error('Error deleting income:', error.message);
          return;
        }

        set((state) => ({
          incomes: state.incomes.filter((income) => income.id !== id),
        }));
      },

      // Compute total income
      getTotalIncome: () => {
        return get().incomes.reduce((total, income) => total + income.amount, 0);
      },
    }),
    {
      name: 'income-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
