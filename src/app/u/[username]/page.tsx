import { createSupabaseServerClientForServerComponent } from "@/app/api/auth/_lib/supabaseserver";
import { getUserLinks } from "@/lib/queries/links";
import { getUserPresence } from "@/lib/queries/presence";
import { getUserTasks } from "@/lib/queries/tasks";
import { getUserDataByUsername } from "@/lib/queries/user";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicProfileHeader } from "@/components/public/public-profile-header";
import type { Task } from "@/lib/datatype";
import { parseDbTimestamp } from "@/lib/time";
import { getThemeById } from "@/lib/banner-themes";

function finishedAtForTask(t: Task) {
  if (t.finish_time) return parseDbTimestamp(t.finish_time);
  if (t.end_date) return new Date(`${t.end_date}T23:59:59.999Z`);
  return parseDbTimestamp(t.created_at);
}

function formatRelativeTimeFromNow(date: Date) {
  const diffMs = date.getTime() - Date.now(); // negative for past
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

  if (Math.abs(sec) < 60) return rtf.format(sec, "second");
  if (Math.abs(min) < 60) return rtf.format(min, "minute");
  if (Math.abs(hr) < 24) return rtf.format(hr, "hour");
  return rtf.format(day, "day");
}

function activityPartsFromCurrentTask(task: Task | null): {
  before: string;
  task: string;
  after: string;
} | null {
  if (!task?.name?.trim()) return null;
  const taskName = String(task.name).trim();
  const tpl = String(task.prefix_sentence ?? "").trim();
  if (!tpl) return { before: "", task: taskName, after: "" };

  if (tpl.includes("{task}")) {
    const [before, after] = tpl.split("{task}");
    return {
      before: (before ?? "").trim(),
      task: taskName,
      after: (after ?? "").trim(),
    };
  }

  // If template doesn't include {task}, treat it as a prefix.
  return { before: tpl, task: taskName, after: "" };
}

function computeInitials(input: {
  firstname?: string | null;
  lastname?: string | null;
  username?: string | null;
}) {
  const a = String(input.firstname ?? "")
    .trim()
    .slice(0, 1)
    .toUpperCase();
  const b = String(input.lastname ?? "")
    .trim()
    .slice(0, 1)
    .toUpperCase();
  if (a || b) return `${a}${b}` || "U";

  const base = String(input.username ?? "U").trim() || "U";
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const x = parts[0]?.[0] ?? "U";
  const y = parts[1]?.[0] ?? "";
  return (x + y).toUpperCase();
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = await createSupabaseServerClientForServerComponent();

  const { username } = await params;
  const { data: userData } = await getUserDataByUsername(supabase, username);

  if (!userData) notFound();

  const { data: userLinks } = await getUserLinks(supabase, userData.user_id);
  const { data: userPresence } = await getUserPresence(
    supabase,
    userData.user_id,
  );
  const { data: userTasks } = await getUserTasks(supabase, userData.user_id);
  const theme = getThemeById((userData as any).banner_color_id);

  if (!userData.public_mode) {
    return (
      <div className="relative min-h-screen bg-linear-to-b from-white/60 via-white/30 to-white/60 p-4 sm:p-6 lg:p-10 flex justify-center">
        {/* theme-based blurred background (like landing, derived from banner color) */}
        <div
          className="pointer-events-none absolute -top-28 -left-28 h-80 w-80 rounded-full blur-3xl opacity-25 -z-10"
          style={{ backgroundImage: theme.gradient }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-104 w-104 rounded-full blur-3xl opacity-20 -z-10"
          style={{ backgroundImage: theme.gradient }}
          aria-hidden="true"
        />

        <div className="fixed left-4 top-4 z-10 hidden sm:block sm:left-6 sm:top-6 lg:left-10 lg:top-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur transition hover:bg-gray-50 hover:shadow"
          >
            En ce moment
          </Link>
        </div>
        <div className="w-full max-w-md sm:max-w-3xl">
          <div className="rounded-3xl border border-gray-200 bg-white/90 backdrop-blur overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Profil privé
              </p>
              <span className="text-sm font-medium text-gray-700">
                @{userData.username}
              </span>
            </div>
            <div className="p-6">
              <p className="text-lg font-semibold text-gray-900">
                Ce profil est privé.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tasks = Array.isArray(userTasks) ? userTasks : [];
  const currentTask = tasks.find((t) => Boolean((t as any).is_current)) ?? null;

  const presenceStatus = userPresence?.status ?? "OFFLINE";
  const presenceStatusLabel =
    presenceStatus === "PAUSE"
      ? "Pause"
      : presenceStatus === "OFFLINE"
        ? "Hors ligne"
        : "En ligne";
  const presenceTooltip =
    presenceStatus === "OFFLINE"
      ? "Je ne suis pas à mon bureau."
      : presenceStatus === "PAUSE"
        ? "Je suis en pause : je peux tout faire sauf travailler (je me détends / je me distrais)."
        : "Je suis connecté sur mon poste de travail (bureau, etc.).";

  const activityParts = activityPartsFromCurrentTask(currentTask);
  const activityFallback =
    userPresence?.current_activity?.trim() ||
    (presenceStatus === "PAUSE"
      ? "En pause"
      : presenceStatus === "OFFLINE"
        ? "Hors ligne"
        : "En train de travailler");

  const recentTasks = tasks
    .filter((t) => Boolean(t.finish_time || t.end_date))
    .slice()
    .sort((a, b) => {
      const endKey = (t: Task) => {
        if (t.finish_time) return t.finish_time;
        if (t.end_date) return `${t.end_date}T23:59:59.999Z`;
        return t.created_at || "";
      };
      return endKey(b).localeCompare(endKey(a));
    })
    .slice(0, 5);

  const initials = computeInitials({
    firstname: userData.firstname,
    lastname: userData.lastname,
    username: userData.username,
  });

  return (
    <div className="relative min-h-screen p-4 sm:p-6 lg:p-10 flex flex-col items-center">
      <div className="fixed left-4 top-4 z-10 hidden sm:block sm:left-6 sm:top-6 lg:left-10 lg:top-10">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur transition hover:bg-gray-50 hover:shadow sm:px-5 sm:py-2"
          aria-label="Retour à l'accueil En ce moment"
        >
          En ce moment
        </Link>
      </div>
      <div className="w-full max-w-md sm:max-w-3xl">
        <div className="rounded-3xl border border-gray-200 bg-white/90 backdrop-blur overflow-hidden shadow-sm">
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Profil public
            </span>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm">
              @{userData.username}
            </span>
          </div>

          <div className="p-0">
            <PublicProfileHeader
              firstname={userData.firstname}
              lastname={userData.lastname}
              username={userData.username}
              profession={userData.profession}
              initials={initials}
              links={Array.isArray(userLinks) ? userLinks : []}
              bannerColorId={(userData as any).banner_color_id}
              avatarUrl={(userData as any).avatar_url}
            />

            <div className="px-6 pb-6">
              {/* Status + big activity (centered) */}
              <div className="mt-7 flex flex-col items-center text-center">
                <div className="relative group">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold shadow-sm ring-1 cursor-help select-none ${
                      presenceStatus === "WORKING"
                        ? "bg-blue-50 text-blue-700 ring-blue-200"
                        : presenceStatus === "PAUSE"
                          ? "bg-yellow-50 text-yellow-700 ring-yellow-200"
                          : "bg-gray-100 text-gray-700 ring-gray-200"
                    }`}
                    aria-label={`Statut: ${presenceStatusLabel}`}
                  >
                    {presenceStatusLabel}
                  </span>
                  <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-[min(22rem,80vw)] -translate-x-1/2 opacity-0 translate-y-1 transition group-hover:opacity-100 group-hover:translate-y-0">
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-lg">
                      <p className="font-semibold text-gray-900">
                        {presenceStatusLabel}
                      </p>
                      <p className="mt-1 text-gray-600">{presenceTooltip}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 max-w-3xl">
                  {activityParts ? (
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.12]">
                      {activityParts.before ? (
                        <span className="text-gray-900">
                          {activityParts.before}{" "}
                        </span>
                      ) : null}
                      <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                        {activityParts.task}
                      </span>
                      {activityParts.after ? (
                        <span className="text-gray-900">
                          {" "}
                          {activityParts.after}
                        </span>
                      ) : null}
                    </p>
                  ) : (
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.12]">
                      {activityFallback}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-gray-600">
                    Activité publique en lecture seule.
                  </p>
                </div>
              </div>

              {/* Recent tasks (read-only) */}
              <div className="mt-8">
                <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">
                    Tâches récentes
                  </p>
                  <div className="mt-4">
                    {recentTasks.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucune tâche.</p>
                    ) : (
                      <div className="max-h-[340px] overflow-y-auto pr-1 space-y-2">
                        {recentTasks.map((t) => (
                          <div
                            key={t.id}
                            className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {t.name}
                                </p>
                                {t.tag && (
                                  <p className="mt-1 text-xs text-gray-500 truncate">
                                    {t.tag}
                                  </p>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 shrink-0">
                                {formatRelativeTimeFromNow(
                                  finishedAtForTask(t),
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
