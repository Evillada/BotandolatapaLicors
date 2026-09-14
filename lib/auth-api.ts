import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Verifica si la petición actual viene de un usuario admin.
 * Usar solo en API routes (Route Handlers).
 * Usa fetch directo con service role para evitar problemas de RLS recursivo.
 */
export async function isAdminRequest(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey) return false

  const cookieStore = await cookies()
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll() {},
    },
  })

  // Leer sesión de cookies (sin llamada de red; middleware ya validó el JWT)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) return false

  const userId = session.user.id
  const base = url.replace(/\/$/, '')

  try {
    const res = await fetch(
      `${base}/rest/v1/admin_users?id=eq.${userId}&select=id&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        cache: 'no-store',
      }
    )
    if (res.ok) {
      const rows = await res.json()
      return Array.isArray(rows) && rows.length > 0
    }
  } catch (err) {
    console.error('[isAdminRequest] fetch error:', err)
  }
  return false
}
