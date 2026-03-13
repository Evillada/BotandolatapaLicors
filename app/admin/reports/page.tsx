"use client"

import { useEffect, useState } from "react"
import { Download, Calendar, TrendingUp, Package, DollarSign } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import type { Order, Product } from "@/lib/supabase/types"
import { toast } from "sonner"

type DateRange = "today" | "week" | "month" | "year"

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>("month")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/orders?limit=500"),
        fetch("/api/products?limit=100&all=true"),
      ])

      const ordersData = await ordersRes.json()
      const productsData = await productsRes.json()

      setOrders(ordersData.data || [])
      setProducts(productsData.data || [])
    } catch (error) {
      toast.error("Error al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }

  const getDateRangeFilter = (range: DateRange) => {
    const now = new Date()
    switch (range) {
      case "today":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate())
      case "week":
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return weekAgo
      case "month":
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return monthAgo
      case "year":
        const yearAgo = new Date(now)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        return yearAgo
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      new Date(order.created_at) >= getDateRangeFilter(dateRange) &&
      order.status !== "cancelled"
  )

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = filteredOrders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const productSales: Record<string, { quantity: number; revenue: number }> = {}
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
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
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const product = products.find((p) => p.name === item.name)
      const category = product?.category || "Otros"
      categorySales[category] = (categorySales[category] || 0) + item.price * item.quantity
    })
  })

  const categoryData = Object.entries(categorySales)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  const getDailyData = () => {
    const dailyMap: Record<string, number> = {}
    filteredOrders.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
      })
      dailyMap[date] = (dailyMap[date] || 0) + order.total
    })

    return Object.entries(dailyMap)
      .slice(-14)
      .map(([date, total]) => ({ date, total }))
  }

  const exportToCSV = () => {
    const headers = ["Fecha", "Pedido #", "Cliente", "Teléfono", "Productos", "Total", "Estado"]
    const rows = filteredOrders.map((order) => [
      new Date(order.created_at).toLocaleDateString("es-CO"),
      order.order_number,
      order.customer_name,
      order.customer_phone,
      order.items.map((i) => `${i.quantity}x ${i.name}`).join("; "),
      order.total,
      order.status,
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte-ventas-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Reporte exportado correctamente")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground mt-1">
            Análisis de ventas y rendimiento
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
            {(["today", "week", "month", "year"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === range
                    ? "bg-gold text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range === "today"
                  ? "Hoy"
                  : range === "week"
                  ? "Semana"
                  : range === "month"
                  ? "Mes"
                  : "Año"}
              </button>
            ))}
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-gold hover:bg-gold-light text-background font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ingresos Totales</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ${totalRevenue.toLocaleString("es-CO")}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gold/10">
              <DollarSign className="h-6 w-6 text-gold" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pedidos</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {totalOrders}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ticket Promedio</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ${Math.round(averageOrderValue).toLocaleString("es-CO")}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Ventas por Día
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getDailyData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString("es-CO")}`,
                  "Ventas",
                ]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#C7A86B"
                strokeWidth={2}
                dot={{ fill: "#C7A86B" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Ventas por Categoría
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString("es-CO")}`,
                  "Ventas",
                ]}
              />
              <Bar dataKey="value" fill="#C7A86B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Productos Más Vendidos
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  #
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Producto
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Unidades Vendidas
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Ingresos
                </th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr
                  key={product.name}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-3 px-4 text-foreground">{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="py-3 px-4 text-foreground">{product.quantity}</td>
                  <td className="py-3 px-4 text-gold font-medium">
                    ${product.revenue.toLocaleString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {topProducts.length === 0 && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No hay datos de ventas para este período
          </div>
        )}
      </div>
    </div>
  )
}
