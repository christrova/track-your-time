import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserTasks(
    supabase: SupabaseClient,
    userId: string
  ) {
    return supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
  }