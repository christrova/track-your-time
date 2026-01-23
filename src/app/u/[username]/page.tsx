import { createSupabaseServerClientForServerComponent } from "@/app/api/auth/_lib/supabaseserver";
import { getUserLinks } from "@/lib/queries/links";
import { getUserPresence } from "@/lib/queries/presence";
import { getUserTasks } from "@/lib/queries/tasks";
import { getUserDataByUsername } from "@/lib/queries/user";
import Link from "next/link";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = await createSupabaseServerClientForServerComponent();

  const { username } = await params;
  console.log("params", username);
  const { data: userData } = await getUserDataByUsername(supabase, username);
  const { data: userLinks } = await getUserLinks(supabase, userData.user_id);
  const { data: userPresence } = await getUserPresence(
    supabase,
    userData.user_id,
  );
  const { data: userTasks } = await getUserTasks(supabase, userData.user_id);

  return (
    <div className="flex flex-col w-full h-screen justify-center items-center text-2xl">
      <h1>this is a Profile page</h1>
      <Link className="mt-10" href="/">
        Go home
      </Link>
    </div>
  );
}
