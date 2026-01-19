'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 🔥 Empêche le rechargement de la page
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

      console.log("data from connexion=>>", data)

      if (!res.ok) {
        throw new Error(data.message || "Connexion error");
      }

      setSuccess("Connexion success 🎉");

      // (Optionnel) Réinitialiser le formulaire
      setEmail("");
      setPassword("");
      
      // Redirect to dashboard
      router.replace('/dashboard');

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
        onSubmit={handleSignin} 
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
