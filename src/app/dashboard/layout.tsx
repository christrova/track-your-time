import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-row w-full">
      <nav className="gap-2 flex flex-col p-3 bg-gray-100">
        <Link href="/dashboard">Overview</Link>
        <Link href="/dashboard/settings">Settings</Link>
      </nav>
      <main className="bg-red-500 flex-1">
        {children}
      </main>
    </div>
  )
}
