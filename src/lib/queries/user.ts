import { SupabaseClient } from "@supabase/supabase-js";
import { User } from "@/lib/datatype";

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

export async function updateUserData(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<User>,
) {
  return supabase
    .from("users")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();
}
