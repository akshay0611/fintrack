"use server"

import { createClient } from "@/utils/supabase/server"

export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  icon: string | null
  color: string | null
  is_system: boolean
  parent_id: string | null
}

export interface CategoryResult {
  data: Category[]
  error: string | null
}

export async function getCategories(type?: "income" | "expense"): Promise<CategoryResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: "Authentication required" }
  }

  let query = supabase
    .from("categories")
    .select("*")
    .eq("is_system", true)
    .order("name", { ascending: true })

  if (type) {
    query = query.eq("type", type)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}
