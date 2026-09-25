"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export interface InvestmentPurchaseInput {
  account_id: string
  name: string
  category: string
  units: number
  unit_price: number
  purchase_date?: string
  description?: string
  notes?: string
}

export interface InvestmentResult {
  data: any
  error: string | null
}

export async function createInvestmentPurchase(input: InvestmentPurchaseInput): Promise<InvestmentResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("type")
    .eq("id", input.account_id)
    .eq("user_id", user.id)
    .single()

  if (!account) {
    return { data: null, error: "Account not found or access denied" }
  }

  if (account.type !== "investment") {
    return { data: null, error: "Investment purchases require an account of type investment" }
  }

  const { data, error } = await supabase.rpc("fn_create_investment_purchase", {
    p_account_id: input.account_id,
    p_name: input.name,
    p_category: input.category,
    p_units: input.units,
    p_unit_price: input.unit_price,
    p_purchase_date: input.purchase_date || new Date().toISOString().split("T")[0],
    p_description: input.description || null,
    p_notes: input.notes || null,
  })

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected/overview")
  revalidatePath("/protected/investments")
  return { data, error: null }
}

export async function deleteInvestmentHolding(id: string): Promise<InvestmentResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("investment_holdings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/protected/overview")
  revalidatePath("/protected/investments")
  return { data, error: null }
}

export async function getInvestmentHoldings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("investment_holdings")
    .select(`
      *,
      categories:categories(id, name, icon)
    `)
    .eq("user_id", user.id)
    .order("purchase_date", { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
