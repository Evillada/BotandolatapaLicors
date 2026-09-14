import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/auth-api'
import { dbInsert, dbSelect } from '@/lib/supabase/service-role'
import type { ProductInsert } from '@/lib/supabase/types'

const PRODUCT_COLUMNS = 'id,name,description,price,original_price,discount,category_id,category,size,image_url,badge,stock,active,is_promotion,created_at,updated_at'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const promotion = searchParams.get('promotion')
    const allParam = searchParams.get('all') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200)
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))

    const isAdmin = allParam && (await isAdminRequest())

    const parts: string[] = [`select=${PRODUCT_COLUMNS}`, `order=created_at.desc`, `limit=${limit}`, `offset=${offset}`]

    if (category) parts.push(`category=eq.${encodeURIComponent(category)}`)
    if (promotion === 'true') parts.push(`is_promotion=eq.true`)
    if (!isAdmin) parts.push(`active=eq.true`)

    const data = await dbSelect('products', parts.join('&'))

    return NextResponse.json({ data, count: data.length })
  } catch (error) {
    console.error('[GET /api/products]', error)
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
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }
    if (body.price < 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })
    }

    const data = await dbInsert('products', body as unknown as Record<string, unknown>)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST /api/products]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
