import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next({ request })
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, { ...options, path: '/' })
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin/login') {
      // Si ya está autenticado y no viene con error, ir al panel
      if (user && !request.nextUrl.searchParams.has('error')) {
        const redirect = NextResponse.redirect(new URL('/admin', request.url))
        supabaseResponse.cookies.getAll().forEach(c =>
          redirect.cookies.set(c.name, c.value, { path: '/' })
        )
        return redirect
      }
      return supabaseResponse
    }

    // Rutas /admin/* distintas de /admin/login: requieren autenticación
    if (!user) {
      const redirect = NextResponse.redirect(new URL('/admin/login', request.url))
      supabaseResponse.cookies.getAll().forEach(c =>
        redirect.cookies.set(c.name, c.value, { path: '/' })
      )
      return redirect
    }

    // El check de admin_users se hace en el Server Component del layout
    // (no en Edge, donde fetch a Supabase puede fallar silenciosamente)
  }

  return supabaseResponse
}
