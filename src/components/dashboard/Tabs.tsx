"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiViewGrid, HiCog } from "react-icons/hi";

const tabs = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HiViewGrid,
    exact: true,
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: HiCog,
    exact: false,
  },
];

export const SideBar = () => {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.includes(href);
  };

  return (
    <nav className="w-64 min-h-screen bg-[#101827] border-r border-gray-800">
      <div className="p-6">
        <div className="mb-8 pb-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-[#2ecfcf] mb-1">
            Gestion du temps
          </h2>
        </div>

        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href, tab.exact);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    active
                      ? "bg-[#142C37] text-[#04D3C9]  font-semibold"
                      : "text-gray-300 hover:text-white"
                  }
                `}
              >
                <Icon className="text-xl" />
                <span className="text-sm font-medium">{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
