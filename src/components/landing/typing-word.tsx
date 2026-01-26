"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  text: string;
  cycles?: number; // how many full type cycles
  typingMs?: number;
  pauseMs?: number;
  className?: string;
};

export function TypingWord({
  text,
  cycles = 2,
  typingMs = 70,
  pauseMs = 650,
  className,
}: Props) {
  const clean = String(text ?? "");
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  useEffect(() => {
    if (!clean) return;
    if (reducedMotion) {
      setValue(clean);
      setDone(true);
      return;
    }

    let i = 0;
    let run = 0;
    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => resolve(), ms);
        // If cancelled, clear ASAP.
        if (cancelled) window.clearTimeout(id);
      });

    const loop = async () => {
      while (!cancelled && run < cycles) {
        // type
        for (i = 1; i <= clean.length && !cancelled; i++) {
          setValue(clean.slice(0, i));
          // eslint-disable-next-line no-await-in-loop
          await sleep(typingMs);
        }
        // eslint-disable-next-line no-await-in-loop
        await sleep(pauseMs);
        run += 1;
        if (run >= cycles) break;
        setValue("");
        // eslint-disable-next-line no-await-in-loop
        await sleep(Math.min(250, pauseMs));
      }
      if (!cancelled) {
        setValue(clean);
        setDone(true);
      }
    };

    void loop();

    return () => {
      cancelled = true;
    };
  }, [clean, cycles, typingMs, pauseMs, reducedMotion]);

  return (
    <span className="relative inline-flex items-baseline">
      {/* Reserve full width so layout doesn't shift during typing */}
      <span className={`invisible select-none ${className ?? ""}`}>
        {clean}
      </span>
      <span className={`absolute inset-0 ${className ?? ""}`}>
        {value}
        {!done && value.length < clean.length && (
          <span
            className="ml-0.5 inline-block h-[0.95em] w-[1.5px] translate-y-[2px] bg-gray-900/70 animate-pulse"
            aria-hidden="true"
          />
        )}
      </span>
    </span>
  );
}

