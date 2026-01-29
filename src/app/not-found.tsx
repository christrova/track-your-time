"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-900 text-white shadow-sm">
          404
        </div>
        <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          Page introuvable
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Cette page n’existe pas ou n’est plus disponible.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
          >
            Retour à l’accueil
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
          >
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
}
