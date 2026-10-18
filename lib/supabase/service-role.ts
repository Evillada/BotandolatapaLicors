/**
 * Cliente REST directo de Supabase con service role.
 * Usa fetch nativo en vez de @supabase/supabase-js para garantizar
 * que el Authorization header siempre sea el service role key.
 */

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role config')
  return { url: url.replace(/\/$/, ''), key }
}

function serviceHeaders(key: string): Record<string, string> {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

export async function dbSelect<T = unknown>(
  table: string,
  query = ''
): Promise<T[]> {
  const { url, key } = getConfig()
  const res = await fetch(`${url}/rest/v1/${table}${query ? '?' + query : ''}`, {
    headers: { ...serviceHeaders(key), Prefer: 'return=minimal' },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase SELECT ${table}: ${res.status} ${text}`)
  }
  return res.json()
}

export async function dbSelectOne<T = unknown>(
  table: string,
  query = ''
): Promise<T | null> {
  const rows = await dbSelect<T>(table, query + (query ? '&' : '') + 'limit=1')
  return rows[0] ?? null
}

export async function dbCount(table: string, query = ''): Promise<number> {
  const { url, key } = getConfig()
  const res = await fetch(`${url}/rest/v1/${table}${query ? '?' + query : ''}`, {
    headers: {
      ...serviceHeaders(key),
      Prefer: 'count=exact',
      Accept: 'application/json',
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase COUNT ${table}: ${res.status} ${text}`)
  }
  const range = res.headers.get('content-range') // e.g. "0-49/123"
  if (range) {
    const total = range.split('/')[1]
    return total === '*' ? 0 : parseInt(total, 10)
  }
  const data = await res.json()
  return Array.isArray(data) ? data.length : 0
}

export async function dbInsert<T = unknown>(
  table: string,
  body: Record<string, unknown>
): Promise<T> {
  const { url, key } = getConfig()
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: serviceHeaders(key),
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase INSERT ${table}: ${res.status} ${text}`)
  }
  const data = await res.json()
  return Array.isArray(data) ? data[0] : data
}

export async function dbUpdate<T = unknown>(
  table: string,
  id: string,
  body: Record<string, unknown>
): Promise<T> {
  const { url, key } = getConfig()
  const res = await fetch(`${url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: serviceHeaders(key),
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase UPDATE ${table}: ${res.status} ${text}`)
  }
  const data = await res.json()
  return Array.isArray(data) ? data[0] : data
}

export async function dbDelete(table: string, id: string): Promise<void> {
  const { url, key } = getConfig()
  const res = await fetch(`${url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...serviceHeaders(key), Prefer: 'return=minimal' },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase DELETE ${table}: ${res.status} ${text}`)
  }
}

export async function dbDeleteMany(table: string, ids: string[]): Promise<void> {
  const { url, key } = getConfig()
  const list = ids.map((id) => `"${id.replace(/"/g, '')}"`).join(',')
  const res = await fetch(`${url}/rest/v1/${table}?id=in.(${encodeURIComponent(list)})`, {
    method: 'DELETE',
    headers: { ...serviceHeaders(key), Prefer: 'return=minimal' },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase DELETE ${table}: ${res.status} ${text}`)
  }
}
