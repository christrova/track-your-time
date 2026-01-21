import { SupabaseClient } from "@supabase/supabase-js"

export async function getUserData(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single()
}

