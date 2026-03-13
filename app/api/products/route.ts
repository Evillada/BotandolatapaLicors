import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminRequest } from '@/lib/auth-api'
import type { ProductInsert } from '@/lib/supabase/types'

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase config')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const promotion = searchParams.get('promotion')
    const allParam = searchParams.get('all') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200)
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))

    const isAdmin = await isAdminRequest()
    const all = allParam && isAdmin

    const supabase = getServiceRoleClient()

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }

    if (promotion === 'true') {
      query = query.eq('is_promotion', true)
    }

    if (!all) {
      query = query.eq('active', true)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase GET products error:', error)
      return NextResponse.json(
        { error: error.message || 'Error al cargar productos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data ?? [], count: count ?? 0 })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}

function sanitizeProductInsert(body: Record<string, unknown>): ProductInsert {
  const price = Number(body.price)
  const stock = Number(body.stock)
  const discount = Number(body.discount)
  const originalPrice = body.original_price != null && body.original_price !== ''
    ? Number(body.original_price)
    : null

  return {
    name: String(body.name ?? '').trim(),
    description: body.description ? String(body.description).trim() || null : null,
    price: Number.isNaN(price) ? 0 : price,
    original_price: originalPrice != null && !Number.isNaN(originalPrice) ? originalPrice : null,
    discount: Number.isNaN(discount) ? 0 : Math.max(0, Math.min(100, discount)),
    category: body.category ? String(body.category).trim() || null : null,
    size: body.size ? String(body.size).trim() || null : null,
    image_url: body.image_url ? String(body.image_url).trim() || null : null,
    badge: body.badge ? String(body.badge).trim() || null : null,
    stock: Number.isNaN(stock) ? 0 : Math.max(0, stock),
    active: body.active !== false,
    is_promotion: body.is_promotion === true,
  }
}

export async function POST(request: Request) {
  try {
    const admin = await isAdminRequest()
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const raw = await request.json().catch(() => ({}))
    if (typeof raw !== 'object' || raw === null) {
      return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 })
    }

    const body = sanitizeProductInsert(raw as Record<string, unknown>)

    if (!body.name) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      )
    }
    if (body.price < 0) {
      return NextResponse.json(
        { error: 'Precio inválido' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()

    const { data, error } = await supabase
      .from('products')
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Supabase POST product error:', error)
      return NextResponse.json(
        { error: error.message || 'Error al crear el producto' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
