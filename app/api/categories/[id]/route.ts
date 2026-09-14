import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/auth-api'
import { dbDelete, dbSelect, dbUpdate } from '@/lib/supabase/service-role'

const CATEGORY_COLUMNS = 'id,name,slug,icon,active,created_at'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await dbSelect(
      'categories',
      `select=${CATEGORY_COLUMNS}&id=eq.${encodeURIComponent(id)}&limit=1`
    )
    if (!data.length) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('[GET /api/categories/[id]]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdminRequest()
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const raw = await request.json().catch(() => ({}))

    const updates: Record<string, unknown> = {}
    if (raw?.name !== undefined) updates.name = String(raw.name).trim()
    if (raw?.slug !== undefined) updates.slug = String(raw.slug).trim()
    if (raw?.icon !== undefined) updates.icon = raw.icon ? String(raw.icon).trim() || null : null
    if (raw?.active !== undefined) updates.active = Boolean(raw.active)

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 })
    }

    const data = await dbUpdate('categories', id, updates)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[PATCH /api/categories/[id]]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdminRequest()
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    await dbDelete('categories', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/categories/[id]]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
