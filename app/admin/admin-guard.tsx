import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Server Component (Node.js, no Edge).
 * - Lee la sesión directamente de las cookies (sin llamada de red a Supabase Auth).
 * - Verifica admin_users con fetch directo y service role (igual al curl que funcionó).
 */
export default async function AdminGuard({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey || !serviceKey) {
    redirect('/admin/login?error=config')
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll() {},
    },
  })

  // getSession lee el JWT de las cookies sin hacer llamada de red
  // (el middleware ya validó el token, así que podemos confiar en él para obtener el userId)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user?.id) {
    redirect('/admin/login')
  }

  const userId = session.user.id
  const base = supabaseUrl.replace(/\/$/, '')

  let isAdmin = false
  let fetchStatus = 0
  let fetchBody = ''

  try {
    const res = await fetch(
      `${base}/rest/v1/admin_users?id=eq.${userId}&select=id&limit=1`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
        cache: 'no-store',
      }
    )
    fetchStatus = res.status
    fetchBody = await res.text()
    console.log(`[AdminGuard] userId=${userId} status=${fetchStatus} body=${fetchBody}`)
    if (res.ok) {
      const rows = JSON.parse(fetchBody)
      isAdmin = Array.isArray(rows) && rows.length > 0
    }
  } catch (err) {
    console.error('[AdminGuard] fetch error:', err)
  }

  if (!isAdmin) {
    console.error(`[AdminGuard] NOT admin – userId=${userId} status=${fetchStatus} body=${fetchBody}`)
    redirect('/admin/login?error=not_admin')
  }

  return <>{children}</>
}
