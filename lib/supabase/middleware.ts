import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

/** Copia las cookies de la respuesta de Supabase a otra respuesta (p. ej. un redirect). */
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value, { path: '/' })
  })
}

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
        // Solo escribir en la respuesta; no modificar request (en Edge no persiste y rompe la sesión)
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, { ...options, path: '/' })
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin/login') {
      if (user) {
        const redirect = NextResponse.redirect(new URL('/admin', request.url))
        copyCookies(supabaseResponse, redirect)
        return redirect
      }
      return supabaseResponse
    }

    if (!user) {
      const redirect = NextResponse.redirect(new URL('/admin/login', request.url))
      copyCookies(supabaseResponse, redirect)
      return redirect
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      const redirect = NextResponse.redirect(new URL('/admin/login', request.url))
      copyCookies(supabaseResponse, redirect)
      return redirect
    }

    const supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (adminError || !adminUser) {
      const redirect = NextResponse.redirect(new URL('/', request.url))
      copyCookies(supabaseResponse, redirect)
      return redirect
    }
  }

  return supabaseResponse
}
