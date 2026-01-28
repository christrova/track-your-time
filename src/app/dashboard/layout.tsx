import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUserDataById } from "@/lib/queries/user";
import { createSupabaseServerClientForServerComponent } from "../api/auth/_lib/supabaseserver";
import { SideBar } from "@/components/dashboard/Tabs";
import { getUserPresence } from "@/lib/queries/presence";
import { DashboardProvider } from "@/providers/dashboard-provider";
import { getUserLinks } from "@/lib/queries/links";
import { getUserTasks } from "@/lib/queries/tasks";

type Props = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: Props) {
  const supabase = await createSupabaseServerClientForServerComponent();

  const {
    data: { user: userAuth },
  } = await supabase.auth.getUser();

  if (!userAuth) {
    redirect("/login");
  }

  const [
    { data: userData, error: userError },
    { data: userPresence, error: presenceError },
    { data: userLinks, error: userLinksError },
    { data: userTasks, error: userTasksError },
  ] = await Promise.all([
    getUserDataById(supabase, userAuth.id),
    getUserPresence(supabase, userAuth.id),
    getUserLinks(supabase, userAuth.id),
    getUserTasks(supabase, userAuth.id),
  ]);

  return (
    <DashboardProvider
      value={{
        userAuth,
        userData,
        userLinks,
        userPresence,
        userTasks,
        userError,
        presenceError,
        userLinksError,
        userTasksError,
      }}
    >
      <div className="relative flex flex-col md:flex-row w-full min-h-screen bg-linear-to-b from-fuchsia-50 via-white to-white">
        {/* soft background blobs (landing-like) */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-linear-to-br from-fuchsia-300/25 via-pink-300/20 to-indigo-300/25 blur-3xl sm:hidden" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-linear-to-br from-indigo-300/20 via-pink-300/15 to-fuchsia-300/20 blur-3xl sm:hidden" />

        <SideBar />
        <main className="relative flex-1 min-w-0 h-full md:h-screen overflow-y-auto bg-transparent">
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
}
