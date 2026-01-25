"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
  }>({});

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitted(true);

    const nextFieldErrors: typeof fieldErrors = {};
    if (!email.trim()) nextFieldErrors.email = "Email requis.";
    if (!username.trim())
      nextFieldErrors.username = "Nom d’utilisateur requis.";
    if (!password) nextFieldErrors.password = "Mot de passe requis.";
    else if (password.length < 6)
      nextFieldErrors.password = "Minimum 6 caractères.";

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      if (nextFieldErrors.email) document.getElementById("email")?.focus();
      else if (nextFieldErrors.username)
        document.getElementById("username")?.focus();
      else if (nextFieldErrors.password)
        document.getElementById("password")?.focus();
      return;
    }

    try {
      setLoading(true);
      setFieldErrors({});

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Erreur lors de la création du compte.",
        );
      }

      setSuccess("Compte créé. Vous pouvez vous connecter.");
      setEmail("");
      setUsername("");
      setPassword("");
      setSubmitted(false);
      setFieldErrors({});

      setTimeout(() => router.push("/login"), 900);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Une minute et c’est parti."
      footer={
        <p className="text-sm text-gray-700">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSignup} className="space-y-4" noValidate>
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
            htmlFor="username"
          >
            Nom d’utilisateur
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => {
              const v = e.target.value;
              setUsername(v);
              if (submitted && fieldErrors.username && v.trim()) {
                setFieldErrors((prev) => ({ ...prev, username: undefined }));
              }
            }}
            aria-invalid={Boolean(fieldErrors.username)}
            aria-describedby={
              fieldErrors.username ? "username-error" : undefined
            }
            className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
              fieldErrors.username
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="ex: christrova"
            required
            disabled={loading}
          />
          {fieldErrors.username && (
            <p id="username-error" className="text-sm text-red-600">
              {fieldErrors.username}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                const v = e.target.value;
                setPassword(v);
                if (submitted) {
                  if (!v) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: "Mot de passe requis.",
                    }));
                  } else if (v.length < 6) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: "Minimum 6 caractères.",
                    }));
                  } else if (fieldErrors.password) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                  }
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
              placeholder="Minimum 6 caractères"
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
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>
    </AuthShell>
  );
}
