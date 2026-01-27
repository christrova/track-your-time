"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Link as UserLink } from "@/lib/datatype";
import { HiLink, HiPencil, HiPlus } from "react-icons/hi";
import { HiColorSwatch } from "react-icons/hi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiGlobeAlt } from "react-icons/hi";
import {
  BANNER_THEMES,
  getThemeById,
  type BannerThemeId,
} from "@/lib/banner-themes";
import { SupabaseClient } from "@/lib/supabaseclient";

type Props = {
  firstname?: string | null;
  lastname?: string | null;
  username?: string;
  profession?: string | null;
  initials: string;
  links: UserLink[];
  bannerColorId?: string | null;
  userId?: string | null;
  avatarUrl?: string | null;
};

const BANNER_HEIGHT = 170; // px
const AVATAR_SIZE = 132; // px
const BANNER_KEY = "tmt.bannerTheme";

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
  const full =
    `${String(firstname ?? "").trim()} ${String(lastname ?? "").trim()}`
      .trim()
      .replace(/\s+/g, " ");
  return full || String(username ?? "").trim() || "—";
}

export function ProfileHeader({
  firstname,
  lastname,
  username,
  profession,
  initials,
  links,
  bannerColorId,
  userId,
  avatarUrl,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrlState, setAvatarUrlState] = useState<string | null>(
    avatarUrl ?? null,
  );
  const [bannerThemeId, setBannerThemeId] = useState<BannerThemeId>("slate");
  const [themeOpen, setThemeOpen] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

  // Sync when user data changes
  useEffect(() => {
    setAvatarUrlState(avatarUrl ?? null);
  }, [avatarUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Prefer DB value (for public banner consistency), fallback to local, then default.
      const fromDb = getThemeById(bannerColorId).id;
      const fromLocal = getThemeById(
        window.localStorage.getItem(BANNER_KEY),
      ).id;
      setBannerThemeId((fromDb || fromLocal) as BannerThemeId);
    } catch {
      // ignore
    }
  }, [bannerColorId]);

  const sortedLinks = useMemo(() => {
    return (Array.isArray(links) ? links : [])
      .filter((l) => Boolean(l?.network_link))
      .slice()
      .sort((a, b) =>
        (a.network_name || "").localeCompare(b.network_name || ""),
      )
      .map((l) => ({ ...l, ...iconForNetwork(l.network_name) }));
  }, [links]);

  const displayName = useMemo(
    () => displayNameFor({ firstname, lastname, username }),
    [firstname, lastname, username],
  );

  const bannerTheme = useMemo(
    () => getThemeById(bannerThemeId),
    [bannerThemeId],
  );

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative w-full" style={{ height: BANNER_HEIGHT }}>
        {/* clipped background layers */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: bannerTheme.gradient }}
          />
          {/* glow / blur */}
          <div
            className="absolute -inset-12 opacity-70 blur-3xl"
            style={{ backgroundImage: bannerTheme.gradient }}
            aria-hidden="true"
          />
          {/* glass overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />
          <div className="absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
        </div>

        {/* Theme picker (simple) */}
        <div className="absolute right-4 top-4 z-20">
          <button
            type="button"
            onClick={() => setThemeOpen((v) => !v)}
            disabled={themeSaving}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 backdrop-blur px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-white/20 transition disabled:opacity-60"
            aria-label="Choisir la couleur de la bannière"
            aria-expanded={themeOpen}
          >
            <HiColorSwatch className="text-base" />
            {themeSaving ? "..." : "Couleur"}
          </button>

          {themeOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-xl p-2 shadow-xl">
              <div className="grid grid-cols-2 gap-2">
                {BANNER_THEMES.map((t) => {
                  const active = t.id === bannerThemeId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={async () => {
                        const nextId = t.id as BannerThemeId;
                        setBannerThemeId(nextId);
                        setThemeOpen(false);
                        try {
                          window.localStorage.setItem(BANNER_KEY, nextId);
                        } catch {
                          // ignore
                        }

                        // Persist to DB so the public banner uses it too.
                        setThemeSaving(true);
                        try {
                          const res = await fetch("/api/user/update", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ banner_color_id: nextId }),
                          });
                          if (!res.ok) {
                            // keep local choice, but don't block UX
                          }
                        } finally {
                          setThemeSaving(false);
                        }
                      }}
                      className={`flex items-center gap-2 rounded-xl px-2 py-2 text-left text-xs font-semibold text-gray-900 hover:bg-gray-50 transition ${
                        active ? "ring-1 ring-gray-300 bg-gray-50" : ""
                      }`}
                    >
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: t.dot }}
                        aria-hidden="true"
                      />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex justify-center -mt-16 mb-2">
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-0 translate-y-4 scale-110 rounded-full bg-black/15 blur-3xl opacity-40"
              aria-hidden="true"
            />
            <div className="relative rounded-full bg-white/40 backdrop-blur-xl p-[4px] shadow-[0_18px_50px_rgba(15,23,42,0.35)]">
              <div
                className="relative rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  backgroundImage: bannerTheme.gradient,
                }}
              >
                <div className="absolute inset-0 bg-linear-to-b from-white/45 via-white/10 to-transparent opacity-80" />
                {avatarUrlState ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrlState}
                    alt="Photo de profil"
                    className="relative h-full w-full object-cover"
                  />
                ) : (
                  <span className="relative text-white text-4xl font-bold tracking-wide">
                    {initials}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarSaving}
              className="absolute -bottom-1 right-1 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:shadow-md transition disabled:opacity-60"
              aria-label="Mettre à jour la photo de profil"
            >
              <HiPencil className="text-xs" />
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !userId) return;
            setAvatarSaving(true);
            try {
              const ext = file.name.split(".").pop() || "jpg";
              const path = `${userId}/avatar.${ext}`;
              const { error } = await SupabaseClient.storage
                .from("avatars")
                .upload(path, file, { upsert: true });
              if (error) throw error;

              const {
                data: { publicUrl },
              } = SupabaseClient.storage.from("avatars").getPublicUrl(path);

              setAvatarUrlState(publicUrl);

              await fetch("/api/user/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar_url: publicUrl }),
              });
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error("Failed to upload avatar", err);
            } finally {
              setAvatarSaving(false);
            }
          }}
        />

        {/* Name + profession */}
        <div className="mt-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{displayName}</p>
          <p className="mt-1 text-sm text-gray-600">{profession || "—"}</p>
        </div>

        {/* Links under the name (LinkedIn-like) */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {sortedLinks.length === 0 ? (
            <button
              type="button"
              onClick={() => router.push("/dashboard/settings?tabs=reseaux")}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              style={{ borderRadius: 6 }}
            >
              <HiPencil className="text-lg" />
              <span className="text-sm font-medium">Ajouter un lien</span>
            </button>
          ) : (
            <>
              {sortedLinks.map((l) => (
                <a
                  key={l.id}
                  href={l.network_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                  style={{ borderRadius: 6 }}
                >
                  <span className={l.accent}>{l.icon}</span>
                  <span className="text-sm font-medium">{l.network_name}</span>
                </a>
              ))}
              <button
                type="button"
                onClick={() => router.push("/dashboard/settings?tabs=reseaux")}
                className="inline-flex items-center justify-center w-10 h-10 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                style={{ borderRadius: 6 }}
                aria-label="Ajouter un lien"
                title="Ajouter un lien"
              >
                <HiPlus className="text-xl" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
