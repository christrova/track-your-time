import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserDataById(
  supabase: SupabaseClient,
  userId: string,
) {
  return supabase.from("users").select("*").eq("user_id", userId).single();
}

export async function getUserDataByUsername(
  supabase: SupabaseClient,
  username: string,
) {
  return supabase.from("users").select("*").eq("username", username).single();
}
