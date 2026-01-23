"use client"
import { useDashboard } from "@/providers/dashboard-provider";
import Link from "next/link";

export default function DashboardPage() {

    const {userData, userPresence} = useDashboard()

    // console.log("userData===>", userData)
    // console.log("userPresence===>", userPresence)

    return (
        <div className="flex flex-col w-full h-screen justify-center items-center text-2xl">
            <h1>this is a DashboardPage</h1>
            <Link className="mt-10" href="/">Go home</Link>
        </div>
    )
}