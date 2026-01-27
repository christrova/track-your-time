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
    <nav className="w-72 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-white/30 bg-white/40 backdrop-blur-xl">
      <div className="p-6">
        <div className="pb-6 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-900 text-white shadow-sm">
              E
            </div>
            <div className="min-w-0">
              <p className="text-base font-extrabold tracking-tight text-gray-900 leading-tight">
                En ce moment
              </p>
              <p className="text-sm text-gray-600 truncate">
                @{userData?.username || "—"}
              </p>
            </div>
          </div>
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
                  flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200
                  ${
                    active
                      ? "bg-white/80 text-gray-900 shadow-sm ring-1 ring-gray-200 font-semibold"
                      : "text-gray-700 hover:text-gray-900 hover:bg-white/60"
                  }
                `}
              >
                <Icon className="text-xl shrink-0" />
                <span className="text-sm font-medium">{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
