import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/auth-api'
import { dbInsert, dbSelect } from '@/lib/supabase/service-role'
import type { OrderInsert } from '@/lib/supabase/types'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 })
    }

    const customer_name = body.customer_name?.trim?.()
    const customer_phone = body.customer_phone?.trim?.()
    const customer_address = body.customer_address?.trim?.()
    const items = Array.isArray(body.items) ? body.items : null

    if (!customer_name || !customer_phone || !customer_address || !items?.length) {
      return NextResponse.json(
        { error: 'Faltan nombre, teléfono, dirección o productos' },
        { status: 400 }
      )
    }

    const total = Number(body.total)
    const subtotal = Number(body.subtotal)
    const orderPayload: OrderInsert = {
      customer_name,
      customer_phone,
      customer_address,
      customer_notes: body.customer_notes?.trim?.() || null,
      items,
      subtotal: Number.isNaN(subtotal) ? total : subtotal,
      delivery_fee: Number(body.delivery_fee) || 0,
      total: Number.isNaN(total) ? 0 : total,
      status: 'pending',
    }

    const data = await dbInsert('orders', orderPayload as unknown as Record<string, unknown>)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST /api/orders]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const admin = await isAdminRequest()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200)
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))

    const parts = [`order=created_at.desc`, `limit=${limit}`, `offset=${offset}`]
    if (status) parts.push(`status=eq.${encodeURIComponent(status)}`)

    const data = await dbSelect('orders', parts.join('&'))

    return NextResponse.json({ data, count: data.length })
  } catch (error) {
    console.error('[GET /api/orders]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
