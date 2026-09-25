"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export interface AccountInput {
  name: string
  type: string
  currency?: string
  initial_balance?: number
  is_archived?: boolean
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
      is_archived: input.is_archived || false,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected/overview")
  revalidatePath("/protected/settings")
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
  revalidatePath("/protected/settings")
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

export interface AccountBalance {
  account_id: string
  user_id: string
  name: string
  type: string
  currency: string
  initial_balance: number
  is_archived: boolean
  current_balance: number
  created_at: string
  updated_at: string
}

export interface AccountBalanceResult {
  data: AccountBalance[]
  error: string | null
}

export async function getAccountBalances(): Promise<AccountBalanceResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("v_account_balances")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}

export async function archiveAccount(id: string, archived: boolean = true): Promise<AccountResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("accounts")
    .update({ is_archived: archived })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected/overview")
  revalidatePath("/protected/settings")
  return { data, error: null }
}
