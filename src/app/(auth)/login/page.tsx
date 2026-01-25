"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SupabaseClient } from "@/lib/supabaseclient";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitted(true);

    const nextFieldErrors: typeof fieldErrors = {};
    if (!email.trim()) nextFieldErrors.email = "Email requis.";
    if (!password) nextFieldErrors.password = "Mot de passe requis.";

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      if (nextFieldErrors.email) document.getElementById("email")?.focus();
      else if (nextFieldErrors.password)
        document.getElementById("password")?.focus();
      return;
    }

    try {
      setLoading(true);
      setFieldErrors({});

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Connexion impossible.");
      }

      if (!data?.session) {
        throw new Error(data?.error || data?.warning || "Session non créée.");
      }

      const { error: sessionError } = await SupabaseClient.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) {
        throw new Error("Impossible d'initialiser la session.");
      }

      setEmail("");
      setPassword("");
      setSubmitted(false);
      setFieldErrors({});
      router.replace("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Connexion"
      subtitle="Connectez-vous pour accéder à votre tableau de bord."
      footer={
        <p className="text-sm text-gray-700">
          Pas encore de compte ?{" "}
          <Link
            href="/signup"
            className="font-semibold text-blue-600 hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              const v = e.target.value;
              setEmail(v);
              if (submitted && fieldErrors.email && v.trim()) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
              fieldErrors.email
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="vous@exemple.com"
            required
            disabled={loading}
          />
          {fieldErrors.email && (
            <p id="email-error" className="text-sm text-red-600">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="password"
          >
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                const v = e.target.value;
                setPassword(v);
                if (submitted && fieldErrors.password && v) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
              className={`w-full pr-24 px-3 py-2 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="••••••••"
              required
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
            <p id="password-error" className="text-sm text-red-600">
              {fieldErrors.password}
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
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </AuthShell>
  );
}
