"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Link as UserLink } from "@/lib/datatype";
import { HiLink, HiPencil } from "react-icons/hi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiGlobeAlt } from "react-icons/hi";

type Props = {
  username?: string;
  profession?: string | null;
  initials: string;
  links: UserLink[];
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

export function ProfileOrbit({ username, profession, initials, links }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem("tmt.profileImage");
      if (saved) setImageDataUrl(saved);
    } catch {
      // ignore
    }
  }, []);

  const sortedLinks = useMemo(() => {
    return (Array.isArray(links) ? links : [])
      .filter((l) => Boolean(l?.network_link))
      .slice()
      .sort((a, b) =>
        (a.network_name || "").localeCompare(b.network_name || ""),
      )
      .map((l) => ({ ...l, ...iconForNetwork(l.network_name) }));
  }, [links]);

  return (
    <div className="w-full">
      {/* Banner */}
      <div
        className="relative w-full bg-linear-to-br from-sky-600 via-blue-700 to-indigo-700"
        style={{ height: BANNER_HEIGHT }}
      >
        <div className="absolute inset-0 opacity-30 blur-2xl bg-linear-to-br from-white/40 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex justify-center -mt-16">
          <div
            className="relative rounded-full overflow-hidden shadow-xl ring-4 ring-white bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center"
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          >
            {imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageDataUrl}
                alt="Photo de profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-4xl font-bold tracking-wide">
                {initials}
              </span>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-2 bottom-1 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:shadow-md transition"
              aria-label="Choisir une image de profil"
            >
              <HiPencil className="text-lg" />
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const result = String(reader.result || "");
              setImageDataUrl(result);
              try {
                window.localStorage.setItem("tmt.profileImage", result);
              } catch {
                // ignore
              }
            };
            reader.readAsDataURL(file);
          }}
        />

        {/* Name + profession */}
        <div className="mt-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{username}</p>
          <p className="mt-1 text-sm text-gray-600">{profession || "—"}</p>
        </div>

        {/* Links under the name (LinkedIn-like) */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {sortedLinks.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun lien.</p>
          ) : (
            sortedLinks.map((l) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
