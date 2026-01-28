"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Supabase peut rediriger le lien de reset password vers /token ou /token/xxx
 * au lieu de /reset-password. Cette page redirige vers la vraie page de reset
 * en conservant le hash (access_token, type=recovery, etc.).
 */
export default function TokenRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const search =
      typeof window !== "undefined" ? window.location.search : "";
    const query = search || "";
    router.replace(`/reset-password${query}${hash}`);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <p className="text-sm text-gray-600">Redirection vers la page de réinitialisation…</p>
    </div>
  );
}
