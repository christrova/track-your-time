import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getUserData } from '@/lib/queries/user'
import { createSupabaseServerClientForServerComponent } from '../api/auth/_lib/supabaseserver'
import { Tabs } from '@/components/dashboard/Tabs'


type Props = {
  children: ReactNode
}

export default async function DashboardLayout({ children }: Props) {
  const supabase = await createSupabaseServerClientForServerComponent()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("user=>>>>", user)

  if (!user) {
    redirect('/login')
  }

  // Récupération profil
  const { data: profile } = await getUserData(supabase, user.id)

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="flex flex-row w-full">
      <Tabs/>
      <main className="bg-red-500 flex-1">
        {children}
      </main>
    </div>
  )
}
