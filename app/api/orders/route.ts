import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminRequest } from '@/lib/auth-api'
import type { OrderInsert } from '@/lib/supabase/types'

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase config')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Cuerpo de la petición inválido' },
        { status: 400 }
      )
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

    const supabase = getServiceRoleClient()

    const { data, error } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single()

    if (error) {
      console.error('Supabase orders POST error:', error)
      return NextResponse.json(
        { error: error.message || 'Error al guardar el pedido' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const admin = await isAdminRequest()
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200)
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))

    const supabase = getServiceRoleClient()

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase orders GET error:', error)
      return NextResponse.json(
        { error: error.message || 'Error al cargar pedidos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data ?? [], count: count ?? 0 })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
