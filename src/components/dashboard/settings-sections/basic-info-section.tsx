"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/providers/dashboard-provider";
import { HiPencil } from "react-icons/hi";

export function BasicInfoSection() {
  const router = useRouter();
  const { userData } = useDashboard();
  const [editing, setEditing] = useState<{
    firstname?: boolean;
    lastname?: boolean;
    profession?: boolean;
    sexe?: boolean;
  }>({});
  const [formData, setFormData] = useState({
    firstname: userData?.firstname || "",
    lastname: userData?.lastname || "",
    profession: userData?.profession || "",
    sexe: userData?.sexe || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (userData) {
      setFormData({
        firstname: userData?.firstname || "",
        lastname: userData?.lastname || "",
        profession: userData?.profession || "",
        sexe: userData?.sexe || "",
      });
    }
  }, [userData]);

  const handleUpdate = async (field: string, value: any) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la mise à jour");
      }

      const fieldNames: { [key: string]: string } = {
        firstname: "Prénom",
        lastname: "Nom",
        profession: "Profession",
        sexe: "Genre",
      };
      setMessage({
        type: "success",
        text: `${fieldNames[field] || field} mis à jour avec succès`,
      });
      setEditing({ ...editing, [field]: false });
      setFormData({ ...formData, [field]: value });

      router.refresh();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Informations de base
        </h2>

        <div className="space-y-4">
          {/* Firstname */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Prénom
              </label>
              {editing.firstname ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) =>
                      setFormData({ ...formData, firstname: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() =>
                      handleUpdate("firstname", formData.firstname)
                    }
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setEditing({ ...editing, firstname: false });
                      setFormData({
                        ...formData,
                        firstname: userData?.firstname || "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-gray-900">
                  {formData.firstname || "Non renseigné"}
                </p>
              )}
            </div>
            {!editing.firstname && (
              <button
                onClick={() => setEditing({ ...editing, firstname: true })}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <HiPencil className="text-sm" />
                Modifier
              </button>
            )}
          </div>

          {/* Lastname */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">Nom</label>
              {editing.lastname ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) =>
                      setFormData({ ...formData, lastname: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleUpdate("lastname", formData.lastname)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setEditing({ ...editing, lastname: false });
                      setFormData({
                        ...formData,
                        lastname: userData?.lastname || "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-gray-900">
                  {formData.lastname || "Non renseigné"}
                </p>
              )}
            </div>
            {!editing.lastname && (
              <button
                onClick={() => setEditing({ ...editing, lastname: true })}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <HiPencil className="text-sm" />
                Modifier
              </button>
            )}
          </div>

          {/* Profession */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Profession
              </label>
              {editing.profession ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) =>
                      setFormData({ ...formData, profession: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() =>
                      handleUpdate("profession", formData.profession)
                    }
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setEditing({ ...editing, profession: false });
                      setFormData({
                        ...formData,
                        profession: userData?.profession || "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-gray-900">
                  {formData.profession || "Non renseigné"}
                </p>
              )}
            </div>
            {!editing.profession && (
              <button
                onClick={() => setEditing({ ...editing, profession: true })}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <HiPencil className="text-sm" />
                Modifier
              </button>
            )}
          </div>

          {/* Gender */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">Genre</label>
              {editing.sexe ? (
                <div className="mt-2 flex gap-2">
                  <select
                    value={formData.sexe}
                    onChange={(e) =>
                      setFormData({ ...formData, sexe: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                    <option value="OTHER">Autre</option>
                  </select>
                  <button
                    onClick={() => handleUpdate("sexe", formData.sexe || null)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setEditing({ ...editing, sexe: false });
                      setFormData({
                        ...formData,
                        sexe: userData?.sexe || "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-gray-900">
                  {formData.sexe === "M"
                    ? "Homme"
                    : formData.sexe === "F"
                      ? "Femme"
                      : formData.sexe === "OTHER"
                        ? "Autre"
                        : "Non renseigné"}
                </p>
              )}
            </div>
            {!editing.sexe && (
              <button
                onClick={() => setEditing({ ...editing, sexe: true })}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <HiPencil className="text-sm" />
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
