"use client";

import { useDashboard } from "@/providers/dashboard-provider";
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
  const { userData } = useDashboard();

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.includes(href);
  };

  return (
    <nav className="w-64 shrink-0 sticky top-0 h-screen overflow-y-auto bg-[#101827] border-r border-gray-800">
      <div className="p-6">
        <div className="h-20 flex items-center pb-6 border-b border-gray-700 flex-col">
          <h2 className="text-2xl font-bold text-[#2ecfcf] leading-tight">
            Gestion du temps
          </h2>
          <p className="text-gray-300 font-semibold flex   mt-1">
            {userData.username}
          </p>
        </div>

        <div className="space-y-1 mt-5">
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
