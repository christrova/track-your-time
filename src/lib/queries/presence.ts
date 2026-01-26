import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserPresence(
  supabase: SupabaseClient,
  userId: string,
) {
  return supabase.from("presence").select("*").eq("user_id", userId).single();
}

export async function updateUserPresence(
  supabase: SupabaseClient,
  userId: string,
  payload: Partial<{
    status: "WORKING" | "PAUSE" | "OFFLINE";
    current_activity: string | null;
    energy_level: number | null;
  }>,
) {
  return supabase
    .from("presence")
    .update(payload)
    .eq("user_id", userId)
    .select("*")
    .single();
}
