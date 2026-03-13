import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

/**
 * Verifica si la petición actual viene de un usuario admin.
 * Usar solo en API routes (Route Handlers).
 */
export async function isAdminRequest(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey) return false

  const cookieStore = await cookies()
  const supabaseAuth = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {},
    },
  })

  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return false

  const supabaseAdmin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data: adminUser } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  return !!adminUser
}
