import { createSupabaseServerClientForServerComponent } from "@/app/api/auth/_lib/supabaseserver";
import { getUserLinks } from "@/lib/queries/links";
import { getUserPresence } from "@/lib/queries/presence";
import { getUserTasks } from "@/lib/queries/tasks";
import { getUserDataByUsername } from "@/lib/queries/user";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = await createSupabaseServerClientForServerComponent();

  const { username } = await params;
  const { data: userData } = await getUserDataByUsername(supabase, username);
  const { data: userLinks } = await getUserLinks(supabase, userData.user_id);
  const { data: userPresence } = await getUserPresence(
    supabase,
    userData.user_id,
  );
  const { data: userTasks } = await getUserTasks(supabase, userData.user_id);

  const currentTask =
    (userTasks || []).find((t) => Boolean((t as any).is_current)) ?? null;

  const statusLabel =
    userPresence?.status === "PAUSE"
      ? "En pause"
      : userPresence?.status === "OFFLINE"
        ? "Hors ligne"
        : currentTask?.prefix_sentence?.trim() && currentTask?.name?.trim()
          ? String(currentTask.prefix_sentence)
              .replace("{task}", String(currentTask.name).trim())
              .trim()
          : userPresence?.current_activity?.trim()
            ? userPresence.current_activity
            : "En train de travailler";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {userData.username}
            </h1>
            <p className="text-gray-600">{userData.profession || "—"}</p>
          </div>
          <div className="text-sm text-gray-500">Profil public</div>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Statut
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {statusLabel}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-semibold text-gray-900">Liens</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(userLinks || []).length === 0 ? (
              <p className="text-sm text-gray-500">Aucun lien.</p>
            ) : (
              userLinks?.map((l) => (
                <a
                  key={l.id}
                  href={l.network_link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {l.network_name}
                </a>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-semibold text-gray-900">Tâches</p>
          <p className="mt-2 text-sm text-gray-500">
            {(userTasks || []).length} au total
          </p>
        </div>
      </div>
    </div>
  );
}
