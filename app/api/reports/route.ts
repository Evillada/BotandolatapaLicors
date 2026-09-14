import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/auth-api'
import { dbSelect } from '@/lib/supabase/service-role'

export async function GET(request: Request) {
  try {
    const admin = await isAdminRequest()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const orderParts = ['status=neq.cancelled', 'order=created_at.desc']
    if (startDate) orderParts.push(`created_at=gte.${startDate}`)
    if (endDate) orderParts.push(`created_at=lte.${endDate}`)

    const [orders, products] = await Promise.all([
      dbSelect<{ total: number; items: { name: string; quantity: number; price: number }[]; created_at: string; status: string }>(
        'orders', orderParts.join('&')
      ),
      dbSelect<{ name: string; category: string }>('products', 'select=name,category'),
    ])

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const productSales: Record<string, { quantity: number; revenue: number }> = {}
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.name]) productSales[item.name] = { quantity: 0, revenue: 0 }
        productSales[item.name].quantity += item.quantity
        productSales[item.name].revenue += item.price * item.quantity
      })
    })

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 10)
      .map(([name, data]) => ({ name, ...data }))

    const categorySales: Record<string, number> = {}
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = products.find((p) => p.name === item.name)
        const category = product?.category || 'Otros'
        categorySales[category] = (categorySales[category] || 0) + item.price * item.quantity
      })
    })

    const dailySales: Record<string, number> = {}
    orders.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      dailySales[date] = (dailySales[date] || 0) + order.total
    })

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalProducts: products.length,
      },
      topProducts,
      categorySales: Object.entries(categorySales).map(([name, value]) => ({ name, value })),
      dailySales: Object.entries(dailySales).map(([date, total]) => ({ date, total })),
    })
  } catch (error) {
    console.error('[GET /api/reports]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
