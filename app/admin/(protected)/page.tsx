"use client"

import { useEffect, useState } from "react"
import { Package, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { Order, Product } from "@/lib/supabase/types"

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  totalProducts: number
  todayOrders: number
}

const COLORS = ["#C7A86B", "#22C55E", "#EF4444", "#3B82F6", "#A855F7"]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    todayOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topProducts, setTopProducts] = useState<{ name: string; value: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/orders?limit=100"),
        fetch("/api/products?limit=100&all=true"),
      ])

      const ordersData = await ordersRes.json()
      const productsData = await productsRes.json()

      const orders: Order[] = ordersData.data || []
      const products: Product[] = productsData.data || []

      const today = new Date().toDateString()
      const todayOrders = orders.filter(
        (o) => new Date(o.created_at).toDateString() === today
      )

      const pendingOrders = orders.filter((o) => o.status === "pending")
      const completedOrders = orders.filter((o) => o.status === "delivered")
      const totalRevenue = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0)

      setStats({
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        completedOrders: completedOrders.length,
        totalRevenue,
        totalProducts: products.length,
        todayOrders: todayOrders.length,
      })

      setRecentOrders(orders.slice(0, 5))

      const productSales: Record<string, number> = {}
      orders.forEach((order) => {
        order.items.forEach((item) => {
          productSales[item.name] = (productSales[item.name] || 0) + item.quantity
        })
      })

      const sortedProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }))

      setTopProducts(sortedProducts)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Pedidos Totales",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Pedidos Hoy",
      value: stats.todayOrders,
      icon: Clock,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Pendientes",
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      title: "Completados",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Ingresos Totales",
      value: `$${stats.totalRevenue.toLocaleString("es-CO")}`,
      icon: DollarSign,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      title: "Productos",
      value: stats.totalProducts,
      icon: Package,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500"
      case "confirmed":
        return "bg-blue-500/10 text-blue-500"
      case "preparing":
        return "bg-purple-500/10 text-purple-500"
      case "delivered":
        return "bg-green-500/10 text-green-500"
      case "cancelled":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "confirmed":
        return "Confirmado"
      case "preparing":
        return "Preparando"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Resumen general de tu negocio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Productos Más Vendidos
          </h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#C7A86B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No hay datos de ventas aún
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Estado de Pedidos
          </h2>
          {stats.totalOrders > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Pendientes", value: stats.pendingOrders },
                    { name: "Completados", value: stats.completedOrders },
                    { name: "Otros", value: stats.totalOrders - stats.pendingOrders - stats.completedOrders },
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {[0, 1, 2].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No hay pedidos aún
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Pedidos Recientes
        </h2>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Estado
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">
                        {order.customer_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_phone}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      ${order.total.toLocaleString("es-CO")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No hay pedidos recientes
          </div>
        )}
      </div>
    </div>
  )
}
