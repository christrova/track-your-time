"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SupabaseClient } from "@/lib/supabaseclient";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const isRecovery = hash.includes("type=recovery");

    if (!isRecovery) {
      setInvalidLink(true);
      setReady(true);
      return;
    }

    const { data: { subscription } } = SupabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          setReady(true);
        }
      }
    );

    const timer = setTimeout(() => {
      setReady(true);
      SupabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (!session) setInvalidLink(true);
      });
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const nextErrors: typeof fieldErrors = {};
    if (!password) nextErrors.password = "Mot de passe requis.";
    else if (password.length < 6)
      nextErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
    if (password !== confirmPassword)
      nextErrors.confirmPassword = "Les mots de passe ne correspondent pas.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSuccess(true);
      await SupabaseClient.auth.signOut();
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready && !invalidLink) {
    return (
      <AuthShell
        title="Réinitialisation"
        subtitle="Vérification du lien..."
        topLink={
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur transition hover:bg-gray-50 hover:shadow sm:px-5 sm:py-2"
          >
            Retour à la connexion
          </Link>
        }
      >
        <p className="text-sm text-gray-600">Chargement...</p>
      </AuthShell>
    );
  }

  if (invalidLink) {
    return (
      <AuthShell
        title="Lien invalide"
        subtitle="Ce lien de réinitialisation est invalide ou a expiré."
        topLink={
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur transition hover:bg-gray-50 hover:shadow sm:px-5 sm:py-2"
          >
            Retour à la connexion
          </Link>
        }
        footer={
          <p className="text-sm text-gray-700">
            <Link
              href="/forgot-password"
              className="font-semibold text-blue-600 hover:underline"
            >
              Redemander un lien
            </Link>
          </p>
        }
      >
        <Link
          href="/forgot-password"
          className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
        >
          Nouveau lien par email
        </Link>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell
        title="Mot de passe mis à jour"
        subtitle="Vous allez être redirigé vers la page de connexion."
        topLink={
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur transition hover:bg-gray-50 hover:shadow sm:px-5 sm:py-2"
          >
            Retour à la connexion
          </Link>
        }
      >
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisissez un nouveau mot de passe sécurisé."
      topLink={
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur transition hover:bg-gray-50 hover:shadow sm:px-5 sm:py-2"
          aria-label="Retour à la connexion"
        >
          Retour à la connexion
        </Link>
      }
      footer={
        <p className="text-sm text-gray-700">
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="password"
          >
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              className={`w-full pr-20 px-3 py-2 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-gray-900"
              disabled={loading}
            >
              {showPassword ? "Masquer" : "Afficher"}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-sm text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="confirmPassword"
          >
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
              fieldErrors.confirmPassword
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="••••••••"
            required
            minLength={6}
            disabled={loading}
          />
          {fieldErrors.confirmPassword && (
            <p className="text-sm text-red-600">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Enregistrement..." : "Enregistrer le mot de passe"}
        </button>
      </form>
    </AuthShell>
  );
}
