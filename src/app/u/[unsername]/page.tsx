import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="flex flex-col w-full h-screen justify-center items-center text-2xl">
            <h1>this is a Profile page</h1>
            <Link className="mt-10" href="/">Go home</Link>
        </div>
    )
}