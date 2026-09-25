"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export interface BudgetInput {
  category_id: string
  amount: number
  start_date: string
  end_date: string
}

export interface BudgetResult {
  data: any
  error: string | null
}

export async function createBudget(input: BudgetInput): Promise<BudgetResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      category_id: input.category_id,
      amount: input.amount,
      start_date: input.start_date,
      end_date: input.end_date,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected/overview")
  return { data, error: null }
}

export async function updateBudget(id: string, input: Partial<BudgetInput>): Promise<BudgetResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("budgets")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected/overview")
  return { data, error: null }
}

export async function deleteBudget(id: string): Promise<BudgetResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected/overview")
  return { data, error: null }
}

export async function getBudgets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
