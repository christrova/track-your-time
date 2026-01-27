export const BANNER_THEMES = [
  {
    id: "slate",
    label: "Dark",
    gradient:
      "linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(30,41,59,1) 55%, rgba(2,132,199,1) 100%)",
    dot: "#111827",
  },
  {
    id: "sky",
    label: "Bleu",
    gradient:
      "linear-gradient(135deg, rgba(2,132,199,1) 0%, rgba(37,99,235,1) 45%, rgba(79,70,229,1) 100%)",
    dot: "#2563EB",
  },
  {
    id: "fuchsia",
    label: "Rose",
    gradient:
      "linear-gradient(135deg, rgba(217,70,239,1) 0%, rgba(236,72,153,1) 50%, rgba(99,102,241,1) 100%)",
    dot: "#EC4899",
  },
  {
    id: "emerald",
    label: "Vert",
    gradient:
      "linear-gradient(135deg, rgba(16,185,129,1) 0%, rgba(20,184,166,1) 55%, rgba(59,130,246,1) 100%)",
    dot: "#10B981",
  },
  {
    id: "amber",
    label: "Orange",
    gradient:
      "linear-gradient(135deg, rgba(245,158,11,1) 0%, rgba(249,115,22,1) 55%, rgba(236,72,153,1) 100%)",
    dot: "#F59E0B",
  },
  {
    id: "violet",
    label: "Violet",
    gradient:
      "linear-gradient(135deg, rgba(124,58,237,1) 0%, rgba(99,102,241,1) 50%, rgba(236,72,153,1) 100%)",
    dot: "#7C3AED",
  },
  {
    id: "roseRed",
    label: "Rouge",
    gradient:
      "linear-gradient(135deg, rgba(244,63,94,1) 0%, rgba(239,68,68,1) 55%, rgba(249,115,22,1) 100%)",
    dot: "#EF4444",
  },
] as const;

export type BannerThemeId = (typeof BANNER_THEMES)[number]["id"];

export function getThemeById(id: string | null | undefined) {
  return (
    BANNER_THEMES.find((t) => t.id === id) ??
    BANNER_THEMES.find((t) => t.id === "slate")!
  );
}

