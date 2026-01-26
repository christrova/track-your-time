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
      <div className="flex w-full h-screen bg-white">
        <SideBar />
        <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
}
