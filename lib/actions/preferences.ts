"use server"

import { createClient } from "@/utils/supabase/server"

export interface ProfilePreferences {
  base_currency: string
  date_format: string
  display_name: string | null
}

export interface PreferencesResult {
  data: ProfilePreferences | null
  error: string | null
}

export async function getPreferences(): Promise<PreferencesResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "Authentication required" }
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("base_currency, date_format, display_name")
    .eq("id", user.id)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
