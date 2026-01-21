import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserLinks(
    supabase: SupabaseClient,
    userId: string
  ) {
    return supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .single()
  }