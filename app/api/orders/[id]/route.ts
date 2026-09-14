import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/auth-api'
import { dbSelect, dbUpdate, dbDelete } from '@/lib/supabase/service-role'
import type { OrderUpdate } from '@/lib/supabase/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdminRequest()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { id } = await params
    const rows = await dbSelect('orders', `id=eq.${encodeURIComponent(id)}&limit=1`)
    if (!rows[0]) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('[GET /api/orders/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdminRequest()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { id } = await params
    const body: OrderUpdate = await request.json()
    const data = await dbUpdate('orders', id, body as Record<string, unknown>)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[PATCH /api/orders/[id]]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
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
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { id } = await params
    await dbDelete('orders', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/orders/[id]]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
