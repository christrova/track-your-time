"use client";

import { HiCog, HiUser, HiLink } from "react-icons/hi";

type SettingsSection = "account" | "basic-info" | "social-networks";

type SettingsSidebarProps = {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
};

const sections = [
  {
    id: "account" as SettingsSection,
    name: "Compte",
    icon: HiCog,
  },
  {
    id: "basic-info" as SettingsSection,
    name: "Informations de base",
    icon: HiUser,
  },
  {
    id: "social-networks" as SettingsSection,
    name: "Réseaux sociaux",
    icon: HiLink,
  },
];

export function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <nav className="w-full bg-white/90 backdrop-blur">
      <div className="max-w-4xl mx-auto px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="flex items-center pb-4 sm:pb-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:gap-1 overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 sm:px-6 sm:py-4 border-b-2 transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? "border-blue-600 text-blue-600 font-semibold"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon className="text-lg" />
                  <span className="text-xs sm:text-sm">{section.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
