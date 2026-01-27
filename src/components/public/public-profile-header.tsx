import type { Link as UserLink } from "@/lib/datatype";
import { HiLink } from "react-icons/hi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiGlobeAlt } from "react-icons/hi";
import { getThemeById } from "@/lib/banner-themes";

type Props = {
  firstname?: string | null;
  lastname?: string | null;
  username?: string;
  profession?: string | null;
  initials: string;
  links: UserLink[];
  bannerColorId?: string | null;
  avatarUrl?: string | null;
};

const BANNER_HEIGHT = 170; // px
const AVATAR_SIZE = 132; // px

function iconForNetwork(name: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("linkedin"))
    return {
      icon: <FaLinkedin className="text-lg" />,
      accent: "text-[#0A66C2]",
    };
  if (n.includes("github"))
    return { icon: <FaGithub className="text-lg" />, accent: "text-gray-900" };
  if (n.includes("site") || n.includes("web") || n.includes("portfolio"))
    return {
      icon: <HiGlobeAlt className="text-xl" />,
      accent: "text-emerald-700",
    };
  return { icon: <HiLink className="text-xl" />, accent: "text-gray-700" };
}

function displayNameFor({
  firstname,
  lastname,
  username,
}: Pick<Props, "firstname" | "lastname" | "username">) {
  const full = `${String(firstname ?? "").trim()} ${String(lastname ?? "").trim()}`
    .trim()
    .replace(/\s+/g, " ");
  return full || String(username ?? "").trim() || "—";
}

export function PublicProfileHeader({
  firstname,
  lastname,
  username,
  profession,
  initials,
  links,
  bannerColorId,
  avatarUrl,
}: Props) {
  const sortedLinks = (Array.isArray(links) ? links : [])
    .filter((l) => Boolean(l?.network_link))
    .slice()
    .sort((a, b) => (a.network_name || "").localeCompare(b.network_name || ""))
    .map((l) => ({ ...l, ...iconForNetwork(l.network_name) }));

  const displayName = displayNameFor({ firstname, lastname, username });
  const bannerTheme = getThemeById(bannerColorId);

  return (
    <div className="w-full">
      {/* Banner */}
      <div
        className="relative w-full"
        style={{ height: BANNER_HEIGHT }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: bannerTheme.gradient }}
          />
          <div
            className="absolute -inset-12 opacity-70 blur-3xl"
            style={{ backgroundImage: bannerTheme.gradient }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />
          <div className="absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="relative px-6 pb-8">
        {/* Avatar */}
        <div className="flex justify-center -mt-[84px] sm:-mt-20 mb-2">
          <div
            className="relative"
          >
            {/* soft halo */}
            <div
              className="pointer-events-none absolute inset-0 translate-y-4 scale-110 rounded-full bg-black/20 blur-3xl opacity-40"
              aria-hidden="true"
            />
            <div className="relative rounded-full bg-white/40 backdrop-blur-xl p-[4px] shadow-[0_24px_60px_rgba(15,23,42,0.35)]">
              <div
                className="relative flex items-center justify-center rounded-full overflow-hidden"
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  backgroundImage: bannerTheme.gradient,
                }}
                aria-label="Avatar"
              >
                <div className="absolute inset-0 bg-linear-to-b from-white/45 via-white/10 to-transparent opacity-80" />
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="relative h-full w-full object-cover"
                  />
                ) : (
                  <span className="relative text-white text-4xl font-bold tracking-wide">
                    {initials}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Name + profession */}
        <div className="mt-4 text-center">
          <p className="text-3xl font-extrabold tracking-tight text-gray-900">
            {displayName}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-sm text-gray-700 shadow-sm">
              {profession || "—"}
            </span>
          </div>
        </div>

        {/* Links under the name (LinkedIn-like) */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {sortedLinks.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun lien.</p>
          ) : (
            sortedLinks.map((l) => (
              <a
                key={l.id}
                href={l.network_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-800 shadow-sm hover:bg-gray-50 hover:shadow transition"
              >
                <span className={l.accent}>{l.icon}</span>
                <span className="text-sm font-medium">{l.network_name}</span>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

