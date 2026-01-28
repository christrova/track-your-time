"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/lib/datatype";
import { useDashboard } from "@/providers/dashboard-provider";
import { SettingsSidebar } from "./settings-sidebar";
import { AccountSection } from "./settings-sections/account-section";
import { BasicInfoSection } from "./settings-sections/basic-info-section";
import { SocialNetworksSection } from "./settings-sections/social-networks-section";

type SettingsSection = "account" | "basic-info" | "social-networks";

const TAB_TO_SECTION: Record<string, SettingsSection> = {
  compte: "account",
  account: "account",
  infos: "basic-info",
  info: "basic-info",
  "basic-info": "basic-info",
  reseaux: "social-networks",
  réseaux: "social-networks",
  social: "social-networks",
  "social-networks": "social-networks",
};

const SECTION_TO_TAB: Record<SettingsSection, string> = {
  account: "compte",
  "basic-info": "infos",
  "social-networks": "reseaux",
};

export function SettingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userData, userLinks: providerLinks, userAuth } = useDashboard();
  const initialSection = useMemo<SettingsSection>(() => {
    const raw = String(searchParams.get("tabs") ?? "")
      .trim()
      .toLowerCase();
    return TAB_TO_SECTION[raw] ?? "account";
  }, [searchParams]);

  const [activeSection, setActiveSection] =
    useState<SettingsSection>(initialSection);
  const [userLinks, setUserLinks] = useState<Link[]>([]);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if (Array.isArray(providerLinks)) {
      setUserLinks(providerLinks);
    } else {
      setUserLinks([]);
    }
  }, [providerLinks]);

  const handleSectionChange = (section: SettingsSection) => {
    setActiveSection(section);
    const next = new URLSearchParams(searchParams.toString());
    next.set("tabs", SECTION_TO_TAB[section]);
    router.replace(`${pathname}?${next.toString()}`);
  };

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
        onSectionChange={handleSectionChange}
      />
      <main className="flex-1 overflow-auto bg-white/90">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:p-8">
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
