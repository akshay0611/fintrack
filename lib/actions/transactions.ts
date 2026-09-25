"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export interface TransactionInput {
  account_id: string
  category_id?: string
  type: "income" | "expense" | "transfer" | "investment_buy" | "investment_sell"
  amount: number
  transaction_date: string
  description: string
  destination_account_id?: string
  notes?: string
}

export interface TransactionResult {
  data: any
  error: string | null
}

export async function createTransaction(input: TransactionInput): Promise<TransactionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      account_id: input.account_id,
      category_id: input.category_id || null,
      type: input.type,
      amount: input.amount,
      transaction_date: input.transaction_date,
      description: input.description,
      destination_account_id: input.destination_account_id || null,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected")
  return { data, error: null }
}

export async function updateTransaction(
  id: string,
  updates: Partial<TransactionInput>
): Promise<TransactionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("transactions")
    .update({
      ...(updates.category_id !== undefined && { category_id: updates.category_id || null }),
      ...(updates.amount !== undefined && { amount: updates.amount }),
      ...(updates.transaction_date !== undefined && { transaction_date: updates.transaction_date }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected")
  return { data, error: null }
}

export async function deleteTransaction(id: string): Promise<TransactionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected")
  return { data, error: null }
}

export async function getTransactions(dateFrom?: string, dateTo?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  let query = supabase
    .from("transactions")
    .select(`
      *,
      categories:categories(id, name, icon)
    `)
    .eq("user_id", user.id)

  if (dateFrom) {
    query = query.gte("transaction_date", dateFrom)
  }
  if (dateTo) {
    query = query.lte("transaction_date", dateTo)
  }

  query = query.order("transaction_date", { ascending: false })

  const { data, error } = await query

  if (error) {
    return { data: null, error: error.message }
  }

  const normalized = (data || []).map((t: any) => ({
    ...t,
    date: t.transaction_date,
    paidVia: t.notes ?? null,
    category_name: t.categories?.name ?? null,
    category_icon: t.categories?.icon ?? null,
  }))

  return { data: normalized, error: null }
}
