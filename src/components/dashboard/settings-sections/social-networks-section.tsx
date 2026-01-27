"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiPencil, HiTrash, HiPlus } from "react-icons/hi";
import { Link } from "@/lib/datatype";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

type SocialNetworksSectionProps = {
  userLinks: Link[];
  onLinkAdded: (link: Link) => void;
  onLinkUpdated: (link: Link) => void;
  onLinkDeleted: (linkId: string) => void;
};

const commonNetworks = [
  { name: "LinkedIn", icon: "💼" },
  { name: "GitHub", icon: "💻" },
  { name: "Twitter", icon: "🐦" },
  { name: "Instagram", icon: "📷" },
  { name: "Facebook", icon: "👥" },
  { name: "Site web", icon: "🌐" },
];

export function SocialNetworksSection({
  userLinks,
  onLinkAdded,
  onLinkUpdated,
  onLinkDeleted,
}: SocialNetworksSectionProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    networkName: "",
    networkLink: "",
  });
  const [editFormData, setEditFormData] = useState<{
    [key: string]: { networkName: string; networkLink: string };
  }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkIdToDelete, setLinkIdToDelete] = useState<string | null>(null);

  const handleAddLink = async () => {
    if (!formData.networkName || !formData.networkLink) {
      setMessage({ type: "error", text: "Veuillez remplir tous les champs" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/links/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          networkName: formData.networkName,
          networkLink: formData.networkLink,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la création du lien");
      }

      if (!result.data) {
        throw new Error("Aucune donnée retournée par le serveur");
      }

      onLinkAdded(result.data);
      setMessage({ type: "success", text: "Lien ajouté avec succès" });
      setFormData({ networkName: "", networkLink: "" });
      setShowAddForm(false);

      router.refresh();
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLink = async (linkId: string) => {
    const data = editFormData[linkId];
    if (!data || !data.networkName || !data.networkLink) {
      setMessage({ type: "error", text: "Veuillez remplir tous les champs" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/links/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId,
          network_name: data.networkName,
          network_link: data.networkLink,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la mise à jour du lien");
      }

      onLinkUpdated(result.data);
      setMessage({ type: "success", text: "Lien mis à jour avec succès" });
      setEditing({ ...editing, [linkId]: false });

      router.refresh();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = (linkId: string) => {
    setLinkIdToDelete(linkId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteLink = async () => {
    if (!linkIdToDelete) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/links/delete?linkId=${linkIdToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Échec de la suppression du lien");
      }

      onLinkDeleted(linkIdToDelete);
      setMessage({ type: "success", text: "Lien supprimé avec succès" });

      router.refresh();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setLinkIdToDelete(null);
    }
  };

  const startEditing = (link: Link) => {
    setEditing({ ...editing, [link.id]: true });
    setEditFormData({
      ...editFormData,
      [link.id]: {
        networkName: link.network_name,
        networkLink: link.network_link,
      },
    });
  };

  const cancelEditing = (linkId: string) => {
    setEditing({ ...editing, [linkId]: false });
    const newEditFormData = { ...editFormData };
    delete newEditFormData[linkId];
    setEditFormData(newEditFormData);
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

      {/* Social Networks */}
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Réseaux sociaux</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <HiPlus className="text-lg" />
            Ajouter un réseau
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ajouter un nouveau réseau
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du réseau
                </label>
                <input
                  type="text"
                  value={formData.networkName}
                  onChange={(e) =>
                    setFormData({ ...formData, networkName: e.target.value })
                  }
                  placeholder="ex: LinkedIn, GitHub, Réseau personnalisé"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien du réseau
                </label>
                <input
                  type="url"
                  value={formData.networkLink}
                  onChange={(e) =>
                    setFormData({ ...formData, networkLink: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddLink}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ networkName: "", networkLink: "" });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Add Common Networks */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            Ajouter rapidement des réseaux courants :
          </p>
          <div className="flex flex-wrap gap-2">
            {commonNetworks.map((network) => {
              const exists = userLinks.some(
                (link) =>
                  link.network_name.toLowerCase() ===
                  network.name.toLowerCase(),
              );
              return (
                <button
                  key={network.name}
                  onClick={() => {
                    setFormData({
                      networkName: network.name,
                      networkLink: "",
                    });
                    setShowAddForm(true);
                  }}
                  disabled={exists || showAddForm}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    exists
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {network.icon} {network.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Links List */}
        <div className="space-y-4">
          {userLinks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun réseau social ajouté pour le moment. Cliquez sur "Ajouter un
              réseau" pour commencer.
            </p>
          ) : (
            userLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
              >
                {editing[link.id] ? (
                  <div className="flex-1 flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editFormData[link.id]?.networkName || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            [link.id]: {
                              ...editFormData[link.id],
                              networkName: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nom du réseau"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={editFormData[link.id]?.networkLink || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            [link.id]: {
                              ...editFormData[link.id],
                              networkLink: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Lien du réseau"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateLink(link.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={() => cancelEditing(link.id)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {link.network_name}
                      </p>
                      <a
                        href={link.network_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {link.network_link}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(link)}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg"
                      >
                        <HiPencil className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      >
                        <HiTrash className="text-lg" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (loading) return;
          setDeleteModalOpen(false);
          setLinkIdToDelete(null);
        }}
        onConfirm={handleConfirmDeleteLink}
        title="Supprimer le lien"
        message="Es-tu sûr de vouloir supprimer ce lien social ? Il disparaîtra de ta page publique."
        confirmText="Supprimer le lien"
        cancelText="Annuler"
        variant="danger"
        isLoading={loading}
      />
    </div>
  );
}
