"use client";

import { useState } from "react";

type PresenceStatus = "WORKING" | "PAUSE" | "OFFLINE";

type Props = {
  value: PresenceStatus;
  onChange: (next: PresenceStatus) => Promise<void>;
};

export function PresenceStatusSelector({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const set = async (next: PresenceStatus) => {
    if (loading || next === value) return;
    setLoading(true);
    try {
      await onChange(next);
    } finally {
      setLoading(false);
    }
  };

  const base =
    "px-3 py-1.5 rounded-full text-sm font-semibold border shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 backdrop-blur px-2 py-2 shadow-sm">
      <button
        type="button"
        onClick={() => set("WORKING")}
        disabled={loading}
        className={`${base} ${
          value === "WORKING"
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white/70 text-gray-700 border-gray-200 hover:bg-white"
        }`}
      >
        Travail
      </button>
      <button
        type="button"
        onClick={() => set("PAUSE")}
        disabled={loading}
        className={`${base} ${
          value === "PAUSE"
            ? "bg-yellow-400 text-gray-900 border-yellow-300"
            : "bg-white/70 text-gray-700 border-gray-200 hover:bg-white"
        }`}
      >
        Pause
      </button>
      <button
        type="button"
        onClick={() => set("OFFLINE")}
        disabled={loading}
        className={`${base} ${
          value === "OFFLINE"
            ? "bg-gray-100 text-gray-900 border-gray-200"
            : "bg-white/70 text-gray-700 border-gray-200 hover:bg-white"
        }`}
      >
        Hors ligne
      </button>
    </div>
  );
}

