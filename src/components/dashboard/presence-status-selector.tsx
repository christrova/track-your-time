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
    "px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => set("WORKING")}
        disabled={loading}
        className={`${base} ${
          value === "WORKING"
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
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
            ? "bg-yellow-500 text-white border-yellow-500"
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
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
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
        }`}
      >
        Hors ligne
      </button>
    </div>
  );
}

