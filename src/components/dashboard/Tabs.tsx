"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export const Tabs = () => {
    const pathname = usePathname()
    return (
        <nav className="gap-2 flex flex-col p-3 bg-gray-100">
            <Link className={pathname === "/dashboard" ? "active": ""} href="/dashboard">Accueil</Link>
            <Link className={pathname.includes("settings") ? "active" : ""} href="/dashboard/settings">Paramètre</Link>
        </nav>
    )
}