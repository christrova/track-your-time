import { createSupabaseServerClientForServerComponent } from "@/app/api/auth/_lib/supabaseserver";
import { Settings } from "@/components/dashboard/settings";
import Link from "next/link";

export default async function DashboardPage() {
  // const {data : userLikns } = await getUserLinks(supabase, userAuth.id)
  return (
    <div className="flex flex-col w-full h-screen justify-center items-center text-2xl">
      <h1>this is a Settings page</h1>
      <Link className="mt-10" href="/">
        Go home
      </Link>
      <Settings />
    </div>
  );
}
