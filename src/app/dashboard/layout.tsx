import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUserDataById } from "@/lib/queries/user";
import { createSupabaseServerClientForServerComponent } from "../api/auth/_lib/supabaseserver";
import { Tabs } from "@/components/dashboard/Tabs";
import { getUserPresence } from "@/lib/queries/presence";
import { DashboardProvider } from "@/providers/dashboard-provider";
import { getUserLinks } from "@/lib/queries/links";

type Props = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: Props) {
  const supabase = await createSupabaseServerClientForServerComponent();

  const {
    data: { user: userAuth },
  } = await supabase.auth.getUser();

  // console.log("user=>>>>", userAuth)
  // console.log("user=>>>>", userAuth?.id)

  if (!userAuth) {
    redirect("/login");
  }

  const [
    { data: userData, error: userError },
    { data: userPresence, error: presenceError },
    { data: userLinks, error: userLinksError },
  ] = await Promise.all([
    getUserDataById(supabase, userAuth.id),
    getUserPresence(supabase, userAuth.id),
    getUserLinks(supabase, userAuth.id),
  ]);

  console.log("userLinks=>>>>", userLinks);

  return (
    <DashboardProvider
      value={{
        userAuth,
        userData,
        userLinks,
        userPresence,
        userError,
        presenceError,
        userLinksError,
      }}
    >
      <div className="flex flex-row w-full">
        <Tabs />
        <main className="bg-red-500 flex-1">{children}</main>
      </div>
    </DashboardProvider>
  );
}
