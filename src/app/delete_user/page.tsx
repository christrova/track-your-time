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

  const handleDeleteUsers = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 🔥 Empêche le rechargement de la page
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      const res = await fetch("/api/auth/deleteusers", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

      setSuccess("Supression réussie ✅🎉");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen justify-center items-center text-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">Supression</h1>

      <div
        className="flex flex-col gap-4 border p-6 rounded-lg shadow-md"
      >
        <button
          type="submit"
          disabled={loading}
          onClick={handleDeleteUsers}
          className="bg-blue-500 text-white p-2 rounded mt-2 disabled:bg-gray-400"
        >
          {loading ? "Supression en cours..." : "Suprimer les users"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>

      <Link className="mt-10 text-blue-500 underline" href="/">
        Go home
      </Link>
    </div>
  );
}
