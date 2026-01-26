/**
 * Supabase/Postgres can return timestamps WITHOUT timezone (e.g. "2026-01-26T10:12:00").
 * JS parses that as *local time*, which can shift relative-time by ~1h depending on timezone.
 * We treat "no timezone" timestamps as UTC by appending "Z".
 */
export function parseDbTimestamp(value: string | null | undefined): Date {
  const v = String(value ?? "").trim();
  if (!v) return new Date(NaN);
  // If it already has timezone info (Z or +hh:mm), keep it as-is.
  if (/[zZ]$/.test(v) || /[+-]\d{2}:\d{2}$/.test(v)) return new Date(v);
  return new Date(`${v}Z`);
}

