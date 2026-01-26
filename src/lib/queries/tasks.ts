import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserTasks(supabase: SupabaseClient, userId: string) {
  return supabase.from("tasks").select("*").eq("user_id", userId);
}

export async function createTask(
  supabase: SupabaseClient,
  userId: string,
  payload: {
    name: string;
    tag?: string | null;
    prefix_sentence?: string | null;
    is_current?: boolean | null;
    start_time?: string | null;
    finish_time?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    is_recurring?: boolean;
    is_planned?: boolean;
  },
) {
  return supabase
    .from("tasks")
    .insert({
      user_id: userId,
      name: payload.name,
      tag: payload.tag ?? null,
      prefix_sentence: payload.prefix_sentence ?? null,
      is_current: payload.is_current ?? false,
      start_time: payload.start_time ?? null,
      finish_time: payload.finish_time ?? null,
      start_date: payload.start_date ?? null,
      end_date: payload.end_date ?? null,
      is_recurring: payload.is_recurring ?? false,
      is_planned: payload.is_planned ?? false,
    })
    .select("*")
    .single();
}

export async function updateTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  payload: Partial<{
    name: string;
    tag: string | null;
    prefix_sentence: string | null;
    is_current: boolean | null;
    start_time: string | null;
    finish_time: string | null;
    start_date: string | null;
    end_date: string | null;
    is_recurring: boolean;
    is_planned: boolean;
  }>,
) {
  return supabase
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("*")
    .single();
}
