import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
// Endpoint temporal de diagnóstico: GET /api/admin/debug
// Eliminar después de resolver el problema de acceso al admin
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const result: Record<string, unknown> = {
    env: {
      url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING',
      anonKey: anonKey ? 'OK (' + anonKey.length + ' chars)' : 'MISSING',
      serviceKey: serviceKey ? 'OK (' + serviceKey.length + ' chars)' : 'MISSING',
    },
    user: null,
    userError: null,
    adminRow: null,
    adminError: null,
    cookieNames: [] as string[],
  }

  try {
    const cookieStore = await cookies()
    result.cookieNames = cookieStore.getAll().map(c => c.name)

    if (supabaseUrl && anonKey) {
      const supabase = createServerClient(supabaseUrl, anonKey, {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      })

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      result.user = user ? { id: user.id, email: user.email } : null
      result.userError = userError?.message ?? null

      if (user && serviceKey) {
        const base = supabaseUrl.replace(/\/$/, '')
        const res = await fetch(
          `${base}/rest/v1/admin_users?id=eq.${encodeURIComponent(user.id)}&select=id,email,role&limit=1`,
          {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
              'Accept': 'application/json',
            },
            cache: 'no-store',
          }
        )
        const text = await res.text()
        result.adminFetchStatus = res.status
        try { result.adminRow = JSON.parse(text)[0] ?? null } catch { result.adminRow = text }
        result.adminError = res.ok ? null : text
      }
    }
  } catch (err) {
    result.exception = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
