import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserPresence(
    supabase: SupabaseClient,
    userId: string
  ) {
    return supabase
      .from('presence')
      .select('*')
      .eq('user_id', userId)
      .single()
  }