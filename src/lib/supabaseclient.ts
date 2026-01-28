import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseBrowserClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Your project's URL and API key are required to create a Supabase client!"
    );
  }
  client = createBrowserClient(url, key);
  return client;
}

export const SupabaseClient = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    return (getSupabaseBrowserClient() as Record<string, unknown>)[prop as string];
  },
});
