"use client";

import { useState, useEffect } from "react";
import { Link } from "@/lib/datatype";
import { useDashboard } from "@/providers/dashboard-provider";
import { SettingsSidebar } from "./settings-sidebar";
import { AccountSection } from "./settings-sections/account-section";
import { BasicInfoSection } from "./settings-sections/basic-info-section";
import { SocialNetworksSection } from "./settings-sections/social-networks-section";

type SettingsSection = "account" | "basic-info" | "social-networks";

export function SettingsContent() {
  const { userData, userLinks: providerLinks, userAuth } = useDashboard();
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("account");
  const [userLinks, setUserLinks] = useState<Link[]>([]);

  useEffect(() => {
    if (Array.isArray(providerLinks)) {
      setUserLinks(providerLinks);
    } else {
      setUserLinks([]);
    }
  }, [providerLinks]);

  const handleLinkAdded = (newLink: Link) => {
    setUserLinks((prev) => {
      const updated = [...prev, newLink];
      return updated;
    });
  };

  const handleLinkUpdated = (updatedLink: Link) => {
    setUserLinks((prev) =>
      prev.map((link) => (link.id === updatedLink.id ? updatedLink : link)),
    );
  };

  const handleLinkDeleted = (linkId: string) => {
    setUserLinks((prev) => prev.filter((link) => link.id !== linkId));
  };

  return (
    <div className="flex flex-col w-full">
      <SettingsSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="flex-1 overflow-auto bg-white">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {userData?.firstname && userData?.lastname
                ? `${userData.firstname} ${userData.lastname}`
                : userData?.username || "Utilisateur"}
            </h1>
            {userData?.username && (
              <p className="text-gray-500">
                Nom d'utilisateur : {userData.username}
              </p>
            )}
          </div>

          {activeSection === "account" && <AccountSection />}
          {activeSection === "basic-info" && <BasicInfoSection />}
          {activeSection === "social-networks" && (
            <SocialNetworksSection
              userLinks={userLinks}
              onLinkAdded={handleLinkAdded}
              onLinkUpdated={handleLinkUpdated}
              onLinkDeleted={handleLinkDeleted}
            />
          )}
        </div>
      </main>
    </div>
  );
}
