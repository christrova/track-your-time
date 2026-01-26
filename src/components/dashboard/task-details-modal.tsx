"use client";

import { useEffect, useMemo, useState } from "react";
import { HiX } from "react-icons/hi";
import type { Task } from "@/lib/datatype";

function toDateInputValue(isoDate: string | null | undefined) {
  if (!isoDate) return "";
  // expects YYYY-MM-DD
  return isoDate.slice(0, 10);
}

function toDateTimeLocalValue(iso: string | null | undefined) {
  if (!iso) return "";
  // expects YYYY-MM-DDTHH:mm (no seconds)
  const d = new Date(iso);
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
        className="relative bg-white rounded-md shadow-xl w-full max-w-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {mode === "create"
                ? "Renseigne les infos puis crée la tâche."
                : "Modifie les infos de la tâche puis enregistre."}
            </p>
          </div>
          {!isSaving && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md p-1"
              aria-label="Fermer"
            >
              <HiX className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nom</label>
              <input
                value={String(draft.name ?? "")}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de la tâche"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Tag</label>
              <input
                value={String(draft.tag ?? "")}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    tag: e.target.value ? e.target.value : null,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: sport, dev, admin"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(draft.is_planned)}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, is_planned: e.target.checked }))
                }
                disabled={isSaving}
              />
              Tâche programmée
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(draft.is_recurring)}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, is_recurring: e.target.checked }))
                }
                disabled={isSaving}
              />
              Récurrente
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-5 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={isSaving || !String(draft.name ?? "").trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving
              ? mode === "create"
                ? "Création..."
                : "Enregistrement..."
              : mode === "create"
                ? "Créer"
                : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
