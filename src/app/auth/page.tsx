'use client'

import Link from "next/link";
import { useState } from "react";

export default function AuthPage() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 🔥 Empêche le rechargement de la page
    setError(null);
    setSuccess(null);

    if (!password || !email || !username) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

      setSuccess("Inscription réussie 🎉");

      // (Optionnel) Réinitialiser le formulaire
      setEmail("");
      setUsername("");
      setPassword("");

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
        onSubmit={handleSignup} 
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

        <div>
          <p>Nom d'utilisateur</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>

      <Link className="mt-10 text-blue-500 underline" href="/">
        Go home
      </Link>
    </div>
  );
}
