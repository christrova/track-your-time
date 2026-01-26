export const TASK_TAGS = [
  "travail",
  "sport",
  "sommeil",
  "pause",
  "étude",
  "lecture",
  "réunion",
  "admin",
  "emails",
  "maison",
  "courses",
  "cuisine",
  "santé",
  "famille",
  "amis",
  "loisirs",
  "développement",
  "design",
  "création",
  "apprentissage",
] as const;

export function normalizeTaskTag(input: unknown): string | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  const noHash = raw.startsWith("#") ? raw.slice(1) : raw;
  // Normalize whitespace and casing for consistent stats keys
  return noHash.replace(/\s+/g, " ").trim().toLowerCase();
}
