"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { useDashboard } from "@/providers/dashboard-provider";
import type { Link as UserLink, Task } from "@/lib/datatype";
import { SupabaseClient } from "@/lib/supabaseclient";
import { createTask, updateTask } from "@/lib/queries/tasks";
import { TaskDetailsModal } from "@/components/dashboard/task-details-modal";
import { ProfileOrbit } from "@/components/dashboard/profile-orbit";
import { PresenceStatusSelector } from "@/components/dashboard/presence-status-selector";

const DEFAULT_PHRASES = [
  {
    id: "p1",
    label: "Je suis en train de {task}",
    category: "action" as const,
  },
  { id: "p2", label: "Je travaille sur {task}", category: "projet" as const },
  { id: "p3", label: "Je fais {task}", category: "action" as const },
  { id: "p4", label: "Je suis sur {task}", category: "projet" as const },
];

const KNOWN_TASKS = [
  "Coder",
  "Sport",
  "Dormir",
  "Pause",
  "Lecture",
  "Réunion",
  "Étude",
  "Écrire",
  "Apprendre",
  "Créer",
  "Marcher",
  "Méditer",
  "Manger",
  "Cuisine",
  "Ménage",
  "Courses",
  "Administratif",
  "Emails",
  "Appels",
  "Planification",
  "Design",
  "Débogage",
  "Documentation",
  "Musique",
  "Jeux",
  "Famille",
  "Amis",
  "Repos",
];

function finishedAtForTask(t: Task) {
  if (t.finish_time) return new Date(t.finish_time);
  if (t.end_date) return new Date(`${t.end_date}T23:59:59.999Z`);
  return new Date(t.created_at);
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

export default function DashboardPage() {
  const router = useRouter();
  const { userAuth, userData, userPresence, userLinks, userTasks } =
    useDashboard();

  const userId: string | undefined = userData?.user_id || userAuth?.id;
  const publicProfileHref = userData?.username
    ? `/u/${userData.username}`
    : null;

  const activityLoadedRef = useRef(false);

  const [customPhrases, setCustomPhrases] = useState<
    { id: string; label: string; category: "action" | "projet" }[]
  >([]);
  const [phraseCategory, setPhraseCategory] = useState<"action" | "projet">(
    "action",
  );
  const [phraseId, setPhraseId] = useState<string>("p1");
  const [taskText, setTaskText] = useState<string>("");
  const [activitySaving, setActivitySaving] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [newPhraseText, setNewPhraseText] = useState("");
  const [newPhraseError, setNewPhraseError] = useState<string | null>(null);
  const [knownTaskQuery, setKnownTaskQuery] = useState("");

  const [tasks, setTasks] = useState<Task[]>(
    Array.isArray(userTasks) ? userTasks : [],
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicMode, setPublicMode] = useState<boolean>(
    Boolean(userData?.public_mode),
  );
  const [publicModeLoading, setPublicModeLoading] = useState(false);
  const [presenceStatus, setPresenceStatus] = useState<
    "WORKING" | "PAUSE" | "OFFLINE"
  >(userPresence?.status || "OFFLINE");

  useEffect(() => {
    if (Array.isArray(userTasks)) setTasks(userTasks);
  }, [userTasks]);

  useEffect(() => {
    if (userPresence?.status) setPresenceStatus(userPresence.status);
  }, [userPresence?.status]);

  useEffect(() => {
    setPublicMode(Boolean(userData?.public_mode));
  }, [userData?.public_mode]);

  const handleTogglePublicMode = async (next: boolean) => {
    setError(null);
    setPublicMode(next);
    setPublicModeLoading(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_mode: next }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Impossible de mettre à jour.");
      router.refresh();
    } catch (e: any) {
      setPublicMode(Boolean(userData?.public_mode));
      setError(e?.message || "Impossible de mettre à jour.");
    } finally {
      setPublicModeLoading(false);
    }
  };

  const plannedTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return tasks
      .filter((t) => t.is_planned)
      .filter((t) => !t.start_date || t.start_date >= today)
      .sort((a, b) => {
        const da = a.start_date ?? "9999-12-31";
        const db = b.start_date ?? "9999-12-31";
        if (da !== db) return da.localeCompare(db);
        const ta = a.start_time ?? "9999-12-31T23:59:59.999Z";
        const tb = b.start_time ?? "9999-12-31T23:59:59.999Z";
        return ta.localeCompare(tb);
      });
  }, [tasks]);

  const recurringTasks = useMemo(() => {
    return tasks
      .filter((t) => t.is_recurring)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [tasks]);

  const recentTasks = useMemo(() => {
    const endKey = (t: Task) => {
      if (t.finish_time) return t.finish_time;
      if (t.end_date) return `${t.end_date}T23:59:59.999Z`;
      return t.created_at || "";
    };

    return tasks
      .filter((t) => Boolean(t.finish_time || t.end_date))
      .slice()
      .sort((a, b) => endKey(b).localeCompare(endKey(a)))
      .slice(0, 5);
  }, [tasks]);

  const socialLinks = useMemo(() => {
    return (Array.isArray(userLinks) ? userLinks : []) as UserLink[];
  }, [userLinks]);

  const initials = useMemo(() => {
    const username: string = userData?.username || userAuth?.email || "U";
    const parts = username.split(/[\s._-]+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "U";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase();
  }, [userData?.username, userAuth?.email]);

  const allPhrases = useMemo(() => {
    return [...DEFAULT_PHRASES, ...customPhrases];
  }, [customPhrases]);

  const filteredPhrases = useMemo(() => {
    return allPhrases.filter((p) => p.category === phraseCategory);
  }, [allPhrases, phraseCategory]);

  const currentPhrase = useMemo(() => {
    const found = allPhrases.find((p) => p.id === phraseId);
    return found ?? DEFAULT_PHRASES[0];
  }, [allPhrases, phraseId]);

  const renderedActivity = useMemo(() => {
    const tpl = currentPhrase.label;
    const task = taskText.trim() || "…";
    return tpl.replace("{task}", task);
  }, [currentPhrase.label, taskText]);

  const knownTaskSuggestions = useMemo(() => {
    const q = knownTaskQuery.trim().toLowerCase();
    const base = Array.from(new Set(KNOWN_TASKS)).sort((a, b) =>
      a.localeCompare(b),
    );
    if (!q) return base;
    return base.filter((t) => t.toLowerCase().includes(q));
  }, [knownTaskQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("tmt.customPhrases");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCustomPhrases(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (activityLoadedRef.current) return;
    activityLoadedRef.current = true;

    const existing = String(userPresence?.current_activity ?? "").trim();
    if (!existing) return;

    const match = allPhrases
      .map((p) => {
        const [a, b] = p.label.split("{task}");
        if (!a || b === undefined) return null;
        if (existing.startsWith(a) && existing.endsWith(b)) {
          const extracted = existing.slice(
            a.length,
            existing.length - b.length,
          );
          return { id: p.id, task: extracted.trim(), cat: p.category };
        }
        return null;
      })
      .find(Boolean);

    if (match) {
      setPhraseCategory(match.cat);
      setPhraseId(match.id);
      setTaskText(match.task);
    } else {
      setTaskText(existing);
    }
  }, [userPresence?.current_activity, allPhrases.length]);

  const saveCurrentActivity = async () => {
    if (!userId) return;
    const next = renderedActivity.replace("…", "").trim();
    setError(null);
    setActivitySaving(true);
    try {
      const res = await fetch("/api/presence/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_activity: next || null,
          status: "WORKING",
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Impossible de mettre à jour.");
      router.refresh();
      setActivityOpen(false);
    } catch (e: any) {
      setError(e?.message || "Impossible de mettre à jour.");
    } finally {
      setActivitySaving(false);
    }
  };

  const updateStatus = async (next: "WORKING" | "PAUSE" | "OFFLINE") => {
    setError(null);
    setPresenceStatus(next);
    try {
      const res = await fetch("/api/presence/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Impossible de mettre à jour.");
      router.refresh();
    } catch (e: any) {
      setPresenceStatus(userPresence?.status || "OFFLINE");
      setError(e?.message || "Impossible de mettre à jour.");
    }
  };

  const addCustomPhrase = () => {
    setNewPhraseError(null);
    const cleaned = newPhraseText.trim();
    if (!cleaned) return;
    const normalized = cleaned.includes("{task}")
      ? cleaned
      : cleaned.includes("{tache}")
        ? cleaned.replaceAll("{tache}", "{task}")
        : cleaned;
    if (!normalized.includes("{task}")) {
      setNewPhraseError('La phrase doit contenir "{task}" (ou "{tache}").');
      return;
    }
    const id = `c_${Date.now()}`;
    setCustomPhrases((prev) => {
      const next = [
        ...prev,
        { id, label: normalized, category: phraseCategory },
      ];
      try {
        window.localStorage.setItem("tmt.customPhrases", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setPhraseId(id);
    setNewPhraseText("");
  };

  const deleteCustomPhrase = (id: string) => {
    setCustomPhrases((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        window.localStorage.setItem("tmt.customPhrases", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    // If we deleted the selected phrase, fallback to a default of same category.
    if (phraseId === id) {
      const fallback =
        DEFAULT_PHRASES.find((p) => p.category === phraseCategory)?.id ?? "p1";
      setPhraseId(fallback);
    }
  };

  const handleCreateTask = async (draft: {
    name: string;
    tag?: string | null;
    is_planned: boolean;
    is_recurring: boolean;
    start_date: string | null;
    end_date: string | null;
    start_time: string | null;
    finish_time: string | null;
  }) => {
    if (!userId) return;
    setError(null);
    setIsCreatingTask(true);
    try {
      const { data, error: createErr } = await createTask(
        SupabaseClient,
        userId,
        {
          name: draft.name,
          tag: draft.tag ?? null,
          start_date: draft.start_date ?? null,
          end_date: draft.end_date ?? null,
          start_time: draft.start_time ?? null,
          finish_time: draft.finish_time ?? null,
          is_planned: Boolean(draft.is_planned),
          is_recurring: Boolean(draft.is_recurring),
        },
      );
      if (createErr) throw new Error(createErr.message);
      if (data) {
        setTasks((prev) => [data as Task, ...prev]);
        setIsCreateTaskOpen(false);
        router.refresh();
      }
    } catch (e: any) {
      setError(e?.message || "Impossible de créer la tâche.");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleUpsertTask = async (next: Partial<Task>) => {
    if (!userId) return;

    // Create mode
    if (isCreateTaskOpen) {
      await handleCreateTask({
        name: String(next.name ?? "").trim(),
        tag: (next.tag as any) ?? null,
        start_date: (next.start_date as any) ?? null,
        end_date: (next.end_date as any) ?? null,
        start_time: (next.start_time as any) ?? null,
        finish_time: (next.finish_time as any) ?? null,
        is_planned: Boolean(next.is_planned),
        is_recurring: Boolean(next.is_recurring),
      });
      return;
    }

    // Edit mode
    if (!selectedTask) return;
    setError(null);
    setIsSaving(true);
    try {
      const payload: Partial<Task> = {
        name: (next.name ?? selectedTask.name) as any,
        tag: (next.tag ?? null) as any,
        start_date: (next.start_date ?? null) as any,
        end_date: (next.end_date ?? null) as any,
        start_time: (next.start_time ?? null) as any,
        finish_time: (next.finish_time ?? null) as any,
        is_planned: Boolean(next.is_planned),
        is_recurring: Boolean(next.is_recurring),
      };

      const { data, error: updErr } = await updateTask(
        SupabaseClient,
        userId,
        selectedTask.id,
        payload as any,
      );
      if (updErr) throw new Error(updErr.message);
      if (data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === data.id ? (data as Task) : t)),
        );
        setSelectedTask(data as Task);
        router.refresh();
      }
    } catch (e: any) {
      setError(e?.message || "Impossible d’enregistrer.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Un aperçu simple de ton profil et de tes tâches.
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          <HiPencil className="text-lg" />
          Éditer
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* PREVIEW / PROFIL */}
        <section className="xl:col-span-8">
          <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Preview
                </span>
                {publicProfileHref ? (
                  <Link
                    href={publicProfileHref}
                    target="_blank"
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Page publique
                  </Link>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    Page publique
                  </span>
                )}
              </div>
              {publicProfileHref ? (
                <Link
                  href={publicProfileHref}
                  target="_blank"
                  className="text-sm font-medium text-gray-700 hover:underline"
                >
                  {userData?.username}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-700">
                  {userData?.username}
                </span>
              )}
            </div>

            <div className="p-0">
              <ProfileOrbit
                username={userData?.username}
                profession={userData?.profession}
                initials={initials}
                links={socialLinks}
              />

              <div className="px-6 pb-6">
                {/* Status + activity (bottom, centered) */}
                <div className="mt-6 flex flex-col items-center gap-3">
                  <PresenceStatusSelector
                    value={presenceStatus}
                    onChange={updateStatus}
                  />

                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setActivityOpen((v) => !v)}
                      className="p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                      aria-label="Modifier la phrase"
                      disabled={activitySaving}
                    >
                      <HiPencil className="text-xl" />
                    </button>

                    {(() => {
                      const [before, after] =
                        currentPhrase.label.split("{task}");
                      const sizeCh = Math.max(taskText.trim().length, 8);
                      return (
                        <div className="text-xl md:text-2xl font-semibold text-gray-900 flex flex-wrap items-baseline gap-2 justify-center">
                          <span>{before?.trim()}</span>
                          <input
                            value={taskText}
                            onChange={(e) => setTaskText(e.target.value)}
                            placeholder="tâche"
                            className="w-auto bg-transparent border-b border-dashed border-gray-400 focus:outline-none focus:border-gray-700 placeholder:text-gray-400"
                            style={{ width: `${sizeCh}ch`, maxWidth: "70vw" }}
                            disabled={activitySaving}
                          />
                          <span>{after?.trim()}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Phrase picker */}
                {activityOpen && (
                  <div className="mt-4 rounded-md border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPhraseCategory("action")}
                        className={`px-3 py-1.5 rounded-md text-sm border ${
                          phraseCategory === "action"
                            ? "bg-gray-900 text-white border-gray-900"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                        disabled={activitySaving}
                      >
                        Action
                      </button>
                      <button
                        onClick={() => setPhraseCategory("projet")}
                        className={`px-3 py-1.5 rounded-md text-sm border ${
                          phraseCategory === "projet"
                            ? "bg-gray-900 text-white border-gray-900"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                        disabled={activitySaving}
                      >
                        Projet
                      </button>
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={saveCurrentActivity}
                          disabled={activitySaving}
                          className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
                        >
                          {activitySaving ? "..." : "Enregistrer"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredPhrases.map((p) => {
                        const isCustom = p.id.startsWith("c_");
                        return (
                          <div key={p.id} className="flex gap-2">
                            <button
                              onClick={() => setPhraseId(p.id)}
                              className={`flex-1 text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                                phraseId === p.id
                                  ? "bg-gray-900 text-white border-gray-900"
                                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
                              }`}
                              disabled={activitySaving}
                            >
                              {p.label.replace("{task}", "…")}
                            </button>
                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => deleteCustomPhrase(p.id)}
                                disabled={activitySaving}
                                className="shrink-0 px-2 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                                aria-label="Supprimer la phrase"
                                title="Supprimer"
                              >
                                <HiTrash className="text-lg" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Ajouter une phrase (doit contenir {"{task}"})
                      </p>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
                          placeholder="ex: Je suis sur {task}"
                          disabled={activitySaving}
                          value={newPhraseText}
                          onChange={(e) => {
                            setNewPhraseText(e.target.value);
                            if (newPhraseError) setNewPhraseError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addCustomPhrase();
                          }}
                        />
                        <button
                          onClick={addCustomPhrase}
                          className="px-3 py-2 rounded-md border border-gray-200 text-gray-800 hover:bg-gray-50"
                          disabled={activitySaving}
                        >
                          Ajouter
                        </button>
                      </div>
                      {newPhraseError && (
                        <p className="mt-2 text-xs text-red-600">
                          {newPhraseError}
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Tâches connues (générales)
                      </p>
                      <input
                        value={knownTaskQuery}
                        onChange={(e) => setKnownTaskQuery(e.target.value)}
                        placeholder="Rechercher une tâche…"
                        className="mb-2 w-full px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
                        disabled={activitySaving}
                      />
                      <div className="flex flex-wrap gap-2">
                        {knownTaskSuggestions.slice(0, 18).map((name) => (
                          <button
                            key={name}
                            onClick={() => setTaskText(name)}
                            className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                            disabled={activitySaving}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent tasks */}
                <div className="mt-8">
                  <div className="w-full rounded-md border border-gray-200 p-5">
                    <p className="text-sm font-semibold text-gray-900">
                      Tâches récentes
                    </p>
                    <div className="mt-4 space-y-2">
                      {recentTasks.length === 0 ? (
                        <p className="text-sm text-gray-500">Aucune tâche.</p>
                      ) : (
                        recentTasks.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTask(t)}
                            className="w-full text-left px-4 py-4 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
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
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COLONNE DROITE */}
        <aside className="xl:col-span-4 space-y-2">
          <div className="rounded-md border border-gray-200 bg-white p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {publicMode ? "Publique" : "Privé"}
              </p>
              <p className="text-sm text-gray-600">
                {publicMode
                  ? "Ton profil est visible."
                  : "Ton profil est caché."}
              </p>
            </div>
            <label className="inline-flex items-center gap-3 select-none">
              <span className="text-xs text-gray-500">
                {publicModeLoading ? "..." : ""}
              </span>
              <button
                type="button"
                onClick={() => handleTogglePublicMode(!publicMode)}
                disabled={publicModeLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  publicMode ? "bg-blue-600" : "bg-gray-300"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Basculer le mode public/privé"
                aria-pressed={publicMode}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    publicMode ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-5 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">
              Ajouter une tâche
            </p>
            <button
              type="button"
              onClick={() => setIsCreateTaskOpen(true)}
              disabled={!userId}
              className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Ajouter une tâche"
            >
              <HiPlus className="text-xl" />
            </button>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">
                Tâches à venir
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {plannedTasks.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucune tâche programmée.
                </p>
              ) : (
                plannedTasks.slice(0, 8).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className="w-full text-left px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {t.start_date} {t.tag ? `• ${t.tag}` : ""}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">
                Actions récurrentes
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {recurringTasks.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucune action récurrente.
                </p>
              ) : (
                recurringTasks.slice(0, 8).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className="w-full text-left px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{t.tag}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <TaskDetailsModal
        isOpen={Boolean(selectedTask) || isCreateTaskOpen}
        task={selectedTask}
        mode={isCreateTaskOpen ? "create" : "edit"}
        onClose={() => {
          setSelectedTask(null);
          setIsCreateTaskOpen(false);
        }}
        onSave={handleUpsertTask}
        isSaving={isCreateTaskOpen ? isCreatingTask : isSaving}
      />
    </div>
  );
}
