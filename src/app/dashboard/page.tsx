"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { useDashboard } from "@/providers/dashboard-provider";
import type { Link as UserLink, Task } from "@/lib/datatype";
import { SupabaseClient } from "@/lib/supabaseclient";
import { createTask, updateTask } from "@/lib/queries/tasks";
import { normalizeTaskTag, TASK_TAGS } from "@/lib/task-tags";
import { parseDbTimestamp } from "@/lib/time";
import { TaskDetailsModal } from "@/components/dashboard/task-details-modal";
import { ProfileHeader } from "@/components/dashboard/profile-header";
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
  const currentTask = useMemo(
    () => tasks.find((t) => Boolean(t.is_current)) ?? null,
    [tasks],
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

  // Switch current task (confirmation + tag required)
  const [switchOpen, setSwitchOpen] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [pendingTaskName, setPendingTaskName] = useState("");
  const [pendingTag, setPendingTag] = useState("");
  const [previousTaskName, setPreviousTaskName] = useState("");
  const [customTaskTags, setCustomTaskTags] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("tmt.customTaskTags");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCustomTaskTags(
          parsed
            .map((t) => normalizeTaskTag(t))
            .filter((t): t is string => Boolean(t)),
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const allTaskTags = useMemo(() => {
    const set = new Set<string>([...TASK_TAGS, ...customTaskTags]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [customTaskTags]);

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

  const currentTaskName = String(currentTask?.name ?? "").trim();

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
    // Prefer DB current task as the source of truth
    if (!currentTask) return;
    setTaskText(String(currentTask.name ?? ""));

    const dbPhrase = String(currentTask.prefix_sentence ?? "").trim();
    if (!dbPhrase) return;

    const existing = allPhrases.find((p) => p.label === dbPhrase);
    if (existing) {
      setPhraseCategory(existing.category);
      setPhraseId(existing.id);
      return;
    }

    // If the DB phrase isn't in the local list, add it as a custom phrase (local)
    const id = `c_${Date.now()}`;
    setCustomPhrases((prev) => {
      const next = [...prev, { id, label: dbPhrase, category: phraseCategory }];
      try {
        window.localStorage.setItem("tmt.customPhrases", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setPhraseId(id);
  }, [currentTask?.id, currentTask?.prefix_sentence, allPhrases.length]);

  useEffect(() => {
    // Fallback: derive from presence.current_activity when no current task exists
    if (currentTask) return;
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
  }, [currentTask?.id, userPresence?.current_activity, allPhrases.length]);

  const saveCurrentActivity = async () => {
    if (!userId) return;
    setError(null);
    // If user typed a different task name, we require confirmation + tag.
    if (currentTask && taskText.trim() && taskText.trim() !== currentTaskName) {
      setPreviousTaskName(currentTaskName);
      setPendingTaskName(taskText.trim());
      setPendingTag("");
      setSwitchOpen(true);
      return;
    }
    if (!currentTask) {
      setError(
        "Aucune tâche courante. Change la tâche puis valide (avec un tag) pour démarrer.",
      );
      return;
    }

    const next = currentPhrase.label
      .replace("{task}", String(currentTask.name ?? "").trim() || "…")
      .replace("…", "")
      .trim();

    setActivitySaving(true);
    try {
      // Update current task phrase in DB
      const { error: updErr } = await updateTask(
        SupabaseClient,
        userId,
        currentTask.id,
        { prefix_sentence: currentPhrase.label },
      );
      if (updErr) throw new Error(updErr.message);

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

  const addCustomTaskTag = (raw: string) => {
    const normalized = normalizeTaskTag(raw);
    if (!normalized) return;
    setCustomTaskTags((prev) => {
      const set = new Set<string>(prev);
      set.add(normalized);
      const next = Array.from(set).sort((a, b) => a.localeCompare(b));
      try {
        window.localStorage.setItem("tmt.customTaskTags", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setPendingTag(normalized);
  };

  const confirmSwitchTask = async () => {
    if (!userId) return;
    const nextName = String(pendingTaskName ?? "").trim();
    const normalizedTag = normalizeTaskTag(pendingTag);
    if (!nextName) return;
    if (!normalizedTag) {
      setError("Le tag est obligatoire pour valider la tâche.");
      return;
    }

    setError(null);
    setSwitchLoading(true);
    const now = new Date().toISOString();
    try {
      // Finish previous current task (if any)
      if (currentTask) {
        const { data: finished, error: finishErr } = await updateTask(
          SupabaseClient,
          userId,
          currentTask.id,
          { finish_time: now, is_current: false },
        );
        if (finishErr) throw new Error(finishErr.message);
        if (finished) {
          setTasks((prev) =>
            prev.map((t) => (t.id === finished.id ? (finished as Task) : t)),
          );
        }
      }

      // Create new current task
      const { data: created, error: createErr } = await createTask(
        SupabaseClient,
        userId,
        {
          name: nextName,
          tag: normalizedTag,
          prefix_sentence: currentPhrase.label,
          is_current: true,
          start_time: now,
          is_planned: false,
          is_recurring: false,
        },
      );
      if (createErr) throw new Error(createErr.message);
      if (created) {
        setTasks((prev) => [created as Task, ...prev]);
      }

      const nextActivity = currentPhrase.label
        .replace("{task}", nextName)
        .replace("…", "")
        .trim();

      await fetch("/api/presence/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_activity: nextActivity || null,
          status: "WORKING",
        }),
      });

      setTaskText(nextName);
      setSwitchOpen(false);
      setPendingTaskName("");
      setPendingTag("");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Impossible de changer la tâche.");
    } finally {
      setSwitchLoading(false);
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
    const normalizedTag = normalizeTaskTag(draft.tag);
    if (!normalizedTag) {
      setError("Le tag est obligatoire pour créer une tâche.");
      return;
    }
    setIsCreatingTask(true);
    try {
      const { data, error: createErr } = await createTask(
        SupabaseClient,
        userId,
        {
          name: draft.name,
          tag: normalizedTag,
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
        tag: normalizeTaskTag((next.tag as any) ?? null),
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
      const normalizedTag = normalizeTaskTag(next.tag ?? null);
      const payload: Partial<Task> = {
        name: (next.name ?? selectedTask.name) as any,
        tag: (normalizedTag ?? null) as any,
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
    <div className="min-h-screen px-4 py-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Tableau de bord
            </h1>
            <p className="mt-1 text-gray-600">
              Une vue simple, moderne et lisible de ton activité.
            </p>
          </div>
          <div className="flex sm:items-start sm:justify-end">
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-4 py-2 text-xs sm:text-sm font-semibold text-gray-800 ring-1 ring-gray-200 shadow-sm hover:bg-white transition"
            >
              <HiPencil className="text-base sm:text-lg" />
              Paramètres
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* PREVIEW / PROFIL */}
          <section className="xl:col-span-8">
            <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Preview
                  </span>
                  {publicProfileHref ? (
                    <Link
                      href={publicProfileHref}
                      target="_blank"
                      className="text-xs px-3 py-1 rounded-full bg-white/70 text-gray-800 ring-1 ring-gray-200 shadow-sm hover:bg-white transition"
                    >
                      Page publique
                    </Link>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full bg-white/70 text-gray-800 ring-1 ring-gray-200 shadow-sm">
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
                <ProfileHeader
                  firstname={userData?.firstname}
                  lastname={userData?.lastname}
                  username={userData?.username}
                  profession={userData?.profession}
                  initials={initials}
                  links={socialLinks}
                  bannerColorId={(userData as any)?.banner_color_id}
                  userId={userId}
                  avatarUrl={(userData as any)?.avatar_url}
                />

                <div className="px-6 pb-6">
                  {/* Status + activity (bottom, centered) */}
                  <div className="mt-6 flex flex-col items-center gap-4">
                    <PresenceStatusSelector
                      value={presenceStatus}
                      onChange={updateStatus}
                    />

                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => setActivityOpen((v) => !v)}
                        className="p-2 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur text-gray-800 shadow-sm hover:bg-white transition"
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
                          <div className="text-xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex flex-wrap items-baseline gap-2 justify-center">
                            <span>{before?.trim()}</span>
                            <input
                              value={taskText}
                              onChange={(e) => setTaskText(e.target.value)}
                              placeholder="tâche"
                              className="w-auto bg-transparent border-b border-dashed border-gray-400 focus:outline-none focus:border-gray-900 placeholder:text-gray-400"
                              style={{ width: `${sizeCh}ch`, maxWidth: "70vw" }}
                              disabled={activitySaving}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const nextName = taskText.trim();
                                  if (
                                    nextName &&
                                    nextName !== currentTaskName
                                  ) {
                                    setPreviousTaskName(currentTaskName);
                                    setPendingTaskName(nextName);
                                    setPendingTag("");
                                    setSwitchOpen(true);
                                  }
                                }
                              }}
                              onBlur={() => {
                                const nextName = taskText.trim();
                                if (nextName && nextName !== currentTaskName) {
                                  setPreviousTaskName(currentTaskName);
                                  setPendingTaskName(nextName);
                                  setPendingTag("");
                                  setSwitchOpen(true);
                                }
                              }}
                            />
                            <span>{after?.trim()}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Phrase picker */}
                  {activityOpen && (
                    <div className="mt-4 rounded-3xl border border-gray-200 bg-white/70 backdrop-blur p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPhraseCategory("action")}
                          className={`px-3 py-1.5 rounded-md text-sm border ${
                            phraseCategory === "action"
                              ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                              : "border-gray-200 bg-white/70 text-gray-800 hover:bg-white"
                          }`}
                          disabled={activitySaving}
                        >
                          Action
                        </button>
                        <button
                          onClick={() => setPhraseCategory("projet")}
                          className={`px-3 py-1.5 rounded-md text-sm border ${
                            phraseCategory === "projet"
                              ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                              : "border-gray-200 bg-white/70 text-gray-800 hover:bg-white"
                          }`}
                          disabled={activitySaving}
                        >
                          Projet
                        </button>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={saveCurrentActivity}
                            disabled={activitySaving}
                            className="px-4 py-2 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition"
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
                        <p className="mb-2 text-xs font-medium text-red-600">
                          Ajouter une phrase personnalisée
                        </p>
                        <p className="mb-2 text-xs text-red-600/90">
                          Ta phrase doit contenir{" "}
                          <code className="rounded bg-red-50 px-1 font-mono text-red-700">
                            {"{task}"}
                          </code>
                          , remplacé par le nom de ta tâche. Ex. : « Je fais{" "}
                          {"{task}"} » → « Je fais du sport ».
                        </p>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
                            placeholder="ex: Je suis en train de {task}"
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
                    </div>
                  )}

                  {/* Recent tasks */}
                  <div className="mt-8">
                    <div className="w-full rounded-md border border-gray-200 p-5">
                      <p className="text-sm font-semibold text-gray-900">
                        Tâches récentes
                      </p>
                      <div className="mt-4">
                        {recentTasks.length === 0 ? (
                          <p className="text-sm text-gray-500">Aucune tâche.</p>
                        ) : (
                          <div className="max-h-[340px] overflow-y-auto pr-1 space-y-2">
                            {recentTasks.map((t) => (
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
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* COLONNE DROITE */}
          <aside className="xl:col-span-4 space-y-3">
            <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur p-5 shadow-sm flex items-center justify-between">
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
            <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur p-5 shadow-sm flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                Ajouter une tâche
              </p>
              <button
                type="button"
                onClick={() => setIsCreateTaskOpen(true)}
                disabled={!userId}
                className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gray-900 text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Ajouter une tâche"
              >
                <HiPlus className="text-xl" />
              </button>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur p-5 shadow-sm">
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
                      className="w-full text-left px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 hover:bg-white transition"
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

            <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur p-5 shadow-sm">
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
                      className="w-full text-left px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 hover:bg-white transition"
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

        {/* Switch current task confirmation (tag required) */}
        {switchOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !switchLoading) {
                setSwitchOpen(false);
                setPendingTaskName("");
                setPendingTag("");
                setTaskText(currentTaskName || previousTaskName);
              }
            }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
            <div
              className="relative bg-white/90 backdrop-blur rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Changer de tâche ?
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {currentTaskName
                    ? `On termine “${currentTaskName}” et on démarre “${pendingTaskName}”.`
                    : `On démarre “${pendingTaskName}”.`}
                </p>
              </div>
              <div className="p-5 space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Tag *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      list="tmt-task-tags-switch"
                      value={pendingTag}
                      onChange={(e) => setPendingTag(e.target.value)}
                      placeholder="ex: sport, sommeil, travail…"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={switchLoading}
                    />
                    {(() => {
                      const normalized = normalizeTaskTag(pendingTag);
                      const canCreate =
                        Boolean(normalized) &&
                        !allTaskTags.includes(String(normalized));
                      if (!canCreate) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => addCustomTaskTag(pendingTag)}
                          disabled={switchLoading}
                          className="shrink-0 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Créer ce tag"
                        >
                          Créer
                        </button>
                      );
                    })()}
                  </div>
                  <datalist id="tmt-task-tags-switch">
                    {allTaskTags.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                  {!normalizeTaskTag(pendingTag) && (
                    <p className="text-xs text-red-600">
                      Le tag est obligatoire.
                    </p>
                  )}
                </div>
              </div>
              <div className="p-5 border-t border-gray-200 bg-white/70 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSwitchOpen(false);
                    setPendingTaskName("");
                    setPendingTag("");
                    setTaskText(currentTaskName || previousTaskName);
                  }}
                  disabled={switchLoading}
                  className="px-4 py-2 text-gray-800 bg-white/70 border border-gray-200 rounded-2xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmSwitchTask}
                  disabled={switchLoading || !normalizeTaskTag(pendingTag)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {switchLoading ? "..." : "Valider"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
