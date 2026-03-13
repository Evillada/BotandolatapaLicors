import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminRequest } from '@/lib/auth-api'

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase config')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(request: Request) {
  try {
    const admin = await isAdminRequest()
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const supabase = getServiceRoleClient()

    let ordersQuery = supabase
      .from('orders')
      .select('*')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })

    if (startDate) {
      ordersQuery = ordersQuery.gte('created_at', startDate)
    }
    if (endDate) {
      ordersQuery = ordersQuery.lte('created_at', endDate)
    }

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error('Supabase error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')

    if (productsError) {
      console.error('Supabase error:', productsError)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0
    const totalOrders = orders?.length || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const productSales: Record<string, { quantity: number; revenue: number }> = {}
    orders?.forEach((order) => {
      order.items.forEach((item: { name: string; quantity: number; price: number }) => {
        if (!productSales[item.name]) {
          productSales[item.name] = { quantity: 0, revenue: 0 }
        }
        productSales[item.name].quantity += item.quantity
        productSales[item.name].revenue += item.price * item.quantity
      })
    })

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 10)
      .map(([name, data]) => ({ name, ...data }))

    const categorySales: Record<string, number> = {}
    orders?.forEach((order) => {
      order.items.forEach((item: { name: string; price: number; quantity: number }) => {
        const product = products?.find((p) => p.name === item.name)
        const category = product?.category || 'Otros'
        categorySales[category] = (categorySales[category] || 0) + item.price * item.quantity
      })
    })

    const dailySales: Record<string, number> = {}
    orders?.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      dailySales[date] = (dailySales[date] || 0) + order.total
    })

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalProducts: products?.length || 0,
      },
      topProducts,
      categorySales: Object.entries(categorySales).map(([name, value]) => ({ name, value })),
      dailySales: Object.entries(dailySales).map(([date, total]) => ({ date, total })),
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
