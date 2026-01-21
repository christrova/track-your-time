import { createSupabaseServerClientForRouteHandler } from './app/api/auth/_lib/supabaseserver'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { supabase } = createSupabaseServerClientForRouteHandler(request, supabaseResponse)

  const { data } = await supabase.auth.getClaims()

  const user = data?.claims

  const url = request.nextUrl.clone()

  if (!user) {
    if (url.pathname === "/login" || url.pathname === "/signup") {
      return supabaseResponse
    }

    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (url.pathname === "/login" || url.pathname === "/signup") {
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup',],
}
