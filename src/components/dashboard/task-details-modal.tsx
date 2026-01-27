"use client";

import { useEffect, useMemo, useState } from "react";
import { HiX } from "react-icons/hi";
import type { Task } from "@/lib/datatype";
import { normalizeTaskTag, TASK_TAGS } from "@/lib/task-tags";
import { parseDbTimestamp } from "@/lib/time";

function toDateInputValue(isoDate: string | null | undefined) {
  if (!isoDate) return "";
  // expects YYYY-MM-DD
  return isoDate.slice(0, 10);
}

function toDateTimeLocalValue(iso: string | null | undefined) {
  if (!iso) return "";
  // expects YYYY-MM-DDTHH:mm (no seconds)
  const d = parseDbTimestamp(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function fromDateTimeLocalValue(v: string) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

type Props = {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (next: Partial<Task>) => Promise<void>;
  isSaving?: boolean;
  mode?: "edit" | "create";
};

export function TaskDetailsModal({
  isOpen,
  task,
  onClose,
  onSave,
  isSaving = false,
  mode = "edit",
}: Props) {
  const [draft, setDraft] = useState<Partial<Task>>({});
  const [customTags, setCustomTags] = useState<string[]>([]);
  const tagValue = String(draft.tag ?? "");
  const normalizedTag = normalizeTaskTag(tagValue);
  const isTagMissing = mode === "create" && !tagValue.trim();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("tmt.customTaskTags");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCustomTags(
          parsed
            .map((t) => normalizeTaskTag(t))
            .filter((t): t is string => Boolean(t)),
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>([...TASK_TAGS, ...customTags]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [customTags]);

  const canCreateTag =
    Boolean(normalizedTag) && !allTags.includes(String(normalizedTag));

  const addCustomTag = () => {
    if (!normalizedTag) return;
    setCustomTags((prev) => {
      const set = new Set<string>(prev);
      set.add(normalizedTag);
      const next = Array.from(set).sort((a, b) => a.localeCompare(b));
      try {
        window.localStorage.setItem("tmt.customTaskTags", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setDraft((p) => ({ ...p, tag: normalizedTag }));
  };

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "create") {
      setDraft({
        name: "",
        tag: null,
        start_date: null,
        end_date: null,
        start_time: null,
        finish_time: null,
        is_planned: true,
        is_recurring: false,
      });
      return;
    }

    if (!task) return;
    setDraft({
      name: task.name ?? "",
      tag: task.tag ?? null,
      start_date: task.start_date ?? null,
      end_date: task.end_date ?? null,
      start_time: task.start_time ?? null,
      finish_time: task.finish_time ?? null,
      is_planned: task.is_planned ?? false,
      is_recurring: task.is_recurring ?? false,
    });
  }, [isOpen, task, mode]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSaving) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isSaving]);

  const title = useMemo(() => {
    if (mode === "create") return "Ajouter une tâche";
    if (!task) return "Détails de la tâche";
    return task.name || "Détails de la tâche";
  }, [task, mode]);

  if (!isOpen) return null;
  if (mode === "edit" && !task) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSaving) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      <div
        className="relative max-w-2xl w-full rounded-3xl bg-white/80 shadow-[0_22px_70px_rgba(15,23,42,0.18)] border border-white/60 backdrop-blur-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-white/60 bg-white/60 backdrop-blur-sm">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-500 mb-1">
              {mode === "create" ? "Nouvelle tâche" : "Tâche en cours"}
            </p>
            <h3 className="text-lg font-semibold text-slate-900 truncate">
              {title}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">
              {mode === "create"
                ? "Décris ce que tu veux planifier, puis enregistre."
                : "Ajuste les informations de ta tâche, puis enregistre."}
            </p>
          </div>
          {!isSaving && (
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 p-1.5 text-slate-400 shadow-sm transition hover:text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white"
              aria-label="Fermer"
            >
              <HiX className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 bg-slate-50/60">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Nom
              </label>
              <input
                value={String(draft.name ?? "")}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                placeholder="Nom de la tâche"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Tag {mode === "create" ? "*" : ""}
              </label>
              <div className="flex items-center gap-2">
                <input
                  list="tmt-task-tags"
                  value={tagValue}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      tag: e.target.value ? e.target.value : null,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                  placeholder="ex: sport, sommeil, travail…"
                  disabled={isSaving}
                />
                {canCreateTag && (
                  <button
                    type="button"
                    onClick={addCustomTag}
                    disabled={isSaving}
                    className="shrink-0 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Créer ce tag"
                  >
                    Créer
                  </button>
                )}
              </div>
              <datalist id="tmt-task-tags">
                {allTags.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              {mode === "create" && (
                <p className="text-xs text-slate-500">
                  Choisis un tag (obligatoire) pour tes futures stats.
                </p>
              )}
              {canCreateTag && (
                <p className="text-xs text-slate-500">
                  Ce tag n’existe pas encore. Clique sur “Créer” pour l’ajouter à
                  ta liste.
                </p>
              )}
              {isTagMissing && (
                <p className="text-xs text-red-600">Le tag est obligatoire.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Date de début
              </label>
              <input
                type="date"
                value={toDateInputValue(draft.start_date)}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    start_date: e.target.value || null,
                  }))
                }
                className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Date de fin
              </label>
              <input
                type="date"
                value={toDateInputValue(draft.end_date)}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    end_date: e.target.value || null,
                  }))
                }
                className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Début (date/heure)
              </label>
              <input
                type="datetime-local"
                value={toDateTimeLocalValue(draft.start_time)}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    start_time: fromDateTimeLocalValue(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Fin (date/heure)
              </label>
              <input
                type="datetime-local"
                value={toDateTimeLocalValue(draft.finish_time)}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    finish_time: fromDateTimeLocalValue(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(draft.is_planned)}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, is_planned: e.target.checked }))
                }
                disabled={isSaving}
                className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
              />
              Tâche programmée
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(draft.is_recurring)}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, is_recurring: e.target.checked }))
                }
                disabled={isSaving}
                className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
              />
              Récurrente
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/60 bg-white/70 backdrop-blur-sm">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={
              isSaving || !String(draft.name ?? "").trim() || isTagMissing
            }
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? mode === "create"
                ? "Création..."
                : "Enregistrement..."
              : mode === "create"
                ? "Créer la tâche"
                : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
