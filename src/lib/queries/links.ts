import { SupabaseClient } from "@supabase/supabase-js";
import { Link } from "@/lib/datatype";

export async function getUserLinks(
    supabase: SupabaseClient,
    userId: string
  ) {
    return supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
  }

export async function createUserLink(
  supabase: SupabaseClient,
  userId: string,
  networkName: string,
  networkLink: string
) {
  return supabase
    .from('links')
    .insert({
      user_id: userId,
      network_name: networkName,
      network_link: networkLink
    })
    .select()
    .single();
}

export async function updateUserLink(
  supabase: SupabaseClient,
  linkId: string,
  updates: Partial<Link>
) {
  return supabase
    .from('links')
    .update(updates)
    .eq('id', linkId)
    .select()
    .single();
}

export async function deleteUserLink(
  supabase: SupabaseClient,
  linkId: string
) {
  return supabase
    .from('links')
    .delete()
    .eq('id', linkId);
}