"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export interface SubscriptionInput {
  account_id?: string
  category_id?: string
  name: string
  amount: number
  cycle: string
  start_date: string
  next_renewal_date: string
  notes?: string
}

export interface SubscriptionResult {
  data: any
  error: string | null
}

export async function createSubscription(input: SubscriptionInput): Promise<SubscriptionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      account_id: input.account_id || null,
      category_id: input.category_id || null,
      name: input.name,
      amount: input.amount,
      cycle: input.cycle,
      start_date: input.start_date,
      next_renewal_date: input.next_renewal_date,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected")
  revalidatePath("/protected/subscriptions")
  return { data, error: null }
}

export async function updateSubscription(id: string, input: Partial<SubscriptionInput>): Promise<SubscriptionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      ...(input.account_id !== undefined && { account_id: input.account_id || null }),
      ...(input.category_id !== undefined && { category_id: input.category_id || null }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.cycle !== undefined && { cycle: input.cycle }),
      ...(input.start_date !== undefined && { start_date: input.start_date }),
      ...(input.next_renewal_date !== undefined && { next_renewal_date: input.next_renewal_date }),
      ...(input.notes !== undefined && { notes: input.notes }),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected")
  revalidatePath("/protected/subscriptions")
  return { data, error: null }
}

export async function deleteSubscription(id: string): Promise<SubscriptionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected/overview")
  revalidatePath("/protected/subscriptions")
  return { data, error: null }
}

export async function getSubscriptions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      categories:categories(id, name, icon)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
