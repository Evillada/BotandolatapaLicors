import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/auth-api'
import { dbInsert, dbSelect } from '@/lib/supabase/service-role'

const CATEGORY_COLUMNS = 'id,name,slug,icon,active,created_at'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const allParam = searchParams.get('all') === 'true'

    const parts = [`select=${CATEGORY_COLUMNS}`, `order=name.asc`]
    if (!allParam) parts.push(`active=eq.true`)

    const data = await dbSelect('categories', parts.join('&'))
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[GET /api/categories]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const admin = await isAdminRequest()
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const raw = await request.json().catch(() => ({}))
    const name = typeof raw?.name === 'string' ? raw.name.trim() : ''

    if (!name) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }

    const slug = raw?.slug ? String(raw.slug).trim() : slugify(name)

    const body: Record<string, unknown> = {
      name,
      slug,
      icon: raw?.icon ? String(raw.icon).trim() || null : null,
      active: raw?.active !== false,
    }

    const data = await dbInsert('categories', body)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST /api/categories]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
