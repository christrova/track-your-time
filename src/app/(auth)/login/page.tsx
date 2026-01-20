'use client'

import { supabase } from "@/lib/supabaseclient";
import Link from "next/link";
import { useState } from "react";

export default function AuthPage() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !email) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Connexion error");
      }


      setEmail("");
      setPassword("");

      if (data.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          console.error("Error setting session:", sessionError);
          throw new Error("Failed to set session");
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          throw new Error("Session not available after setting");
        }
      }

      window.location.href = '/dashboard';

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen justify-center items-center text-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">Inscription</h1>

      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 border p-6 rounded-lg shadow-md"
      >
        <div>
          <p>Email</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border p-2 text-black"
          />
        </div>

        <div>
          <p>Mot de passe</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 text-black"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded mt-2 disabled:bg-gray-400"
        >
          {loading ? "Connection..." : "Se connecter"}
        </button>
      </form>

      <Link className="mt-10 text-blue-500 underline" href="/">
        Go home
      </Link>
    </div>
  );
}
