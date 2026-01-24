"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/providers/dashboard-provider";
import { HiPencil } from "react-icons/hi";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export function AccountSection() {
  const router = useRouter();
  const { userData, userAuth } = useDashboard();
  const [editing, setEditing] = useState<{
    email?: boolean;
    username?: boolean;
    visibility?: boolean;
  }>({});
  const [formData, setFormData] = useState({
    email: userData?.email || userAuth.email || "",
    username: userData?.username || "",
    visibility: userData?.public_mode ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (userData || userAuth) {
      setFormData({
        email: userData?.email || userAuth?.email || "",
        username: userData?.username || "",
        visibility: userData?.public_mode ?? false,
      });
    }
  }, [userData, userAuth]);

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
        email: "Email",
        username: "Nom d'utilisateur",
        public_mode: "Visibilité",
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

  const handleDeleteAccountClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Échec de la suppression du compte");
      }

      window.location.href = "/";
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
      setShowDeleteModal(false);
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

      {/* Account Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Informations du compte
        </h2>

        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                E-mail
              </label>
              {editing.email ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleUpdate("email", formData.email)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setEditing({ ...editing, email: false });
                      setFormData({
                        ...formData,
                        email: userData?.email || userAuth.email || "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-gray-900">{formData.email}</p>
              )}
            </div>
            {!editing.email && (
              <button
                onClick={() => setEditing({ ...editing, email: true })}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <HiPencil className="text-sm" />
                Modifier
              </button>
            )}
          </div>

          {/* Username */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              {editing.username ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleUpdate("username", formData.username)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setEditing({ ...editing, username: false });
                      setFormData({
                        ...formData,
                        username: userData?.username || "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-gray-900">{formData.username}</p>
              )}
            </div>
            {!editing.username && (
              <button
                onClick={() => setEditing({ ...editing, username: true })}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <HiPencil className="text-sm" />
                Modifier
              </button>
            )}
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Visibilité du profil
              </label>
              {editing.visibility ? (
                <div className="mt-2 flex gap-2 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.visibility}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visibility: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {formData.visibility ? "Public" : "Privé"}
                    </span>
                  </label>
                  <button
                    onClick={() =>
                      handleUpdate("public_mode", formData.visibility)
                    }
                    disabled={loading}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setEditing({ ...editing, visibility: false });
                      setFormData({
                        ...formData,
                        visibility: userData?.public_mode ?? false,
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-gray-900">
                  {formData.visibility ? "Public" : "Private"}
                </p>
              )}
            </div>
            {!editing.visibility && (
              <button
                onClick={() => setEditing({ ...editing, visibility: true })}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <HiPencil className="text-sm" />
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Zone de danger</h2>
        <p className="text-sm text-gray-600 mb-4">
          Une fois votre compte supprimé, il n'y a pas de retour en arrière
          possible. Veuillez être certain.
        </p>
        <button
          onClick={handleDeleteAccountClick}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 border border-red-700"
        >
          Supprimer le compte
        </button>
      </div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Supprimer le compte"
        message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront définitivement perdues."
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
        isLoading={loading}
      />
    </div>
  );
}
