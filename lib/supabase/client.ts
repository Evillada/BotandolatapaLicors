import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. En local: crea .env.local en premium-liquor-landing-page con esas variables (ver .env.local.example). En Vercel: añádelas en Settings → Environment Variables.'
    )
  }
  return createBrowserClient<Database>(url, anonKey)
}
