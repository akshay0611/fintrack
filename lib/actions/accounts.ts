"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export interface AccountInput {
  name: string
  type: string
  currency?: string
  initial_balance?: number
}

export interface AccountResult {
  data: any
  error: string | null
}

export async function createAccount(input: AccountInput): Promise<AccountResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      name: input.name,
      type: input.type,
      currency: input.currency || "USD",
      initial_balance: input.initial_balance || 0,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected/overview")
  return { data, error: null }
}

export async function updateAccount(id: string, input: Partial<AccountInput>): Promise<AccountResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("accounts")
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

export async function getAccounts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
