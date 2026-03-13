"use client"

import { useEffect, useState } from "react"
import { Search, MessageCircle, Eye, X, ChevronDown } from "lucide-react"
import type { Order, OrderStatus } from "@/lib/supabase/types"
import { toast } from "sonner"

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pendiente", color: "bg-yellow-500/10 text-yellow-500" },
  { value: "confirmed", label: "Confirmado", color: "bg-blue-500/10 text-blue-500" },
  { value: "preparing", label: "Preparando", color: "bg-purple-500/10 text-purple-500" },
  { value: "delivered", label: "Entregado", color: "bg-green-500/10 text-green-500" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-500/10 text-red-500" },
]

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders?limit=100")
      const data = await res.json()
      setOrders(data.data || [])
    } catch (error) {
      toast.error("Error al cargar pedidos")
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error("Error al actualizar")

      toast.success("Estado actualizado")
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status })
      }
    } catch (error) {
      toast.error("Error al actualizar el estado")
    }
  }

  const getStatusOption = (status: OrderStatus) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0]
  }

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `Hola ${name}, te escribimos de Botando la Tapa Licors respecto a tu pedido.`
    )
    window.open(`https://wa.me/57${phone.replace(/\D/g, "")}?text=${message}`, "_blank")
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_phone.includes(search)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona los pedidos de tus clientes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        >
          <option value="all">Todos los estados</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  # Pedido
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Total
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Fecha
                </th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const status = getStatusOption(order.status)
                return (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                  >
                    <td className="py-4 px-4 font-medium text-foreground">
                      #{order.order_number}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-foreground">
                        {order.customer_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_phone}
                      </p>
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground">
                      ${order.total.toLocaleString("es-CO")}
                    </td>
                    <td className="py-4 px-4">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`appearance-none pr-8 pl-3 py-1.5 rounded-full text-xs font-medium cursor-pointer ${status.color} border-0 focus:outline-none focus:ring-2 focus:ring-gold`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            openWhatsApp(order.customer_phone, order.customer_name)
                          }
                          className="p-2 rounded-lg text-muted-foreground hover:bg-neon/10 hover:text-neon transition-colors"
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No se encontraron pedidos
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                Pedido #{selectedOrder.order_number}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Información del Cliente
                </h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <p className="text-foreground">
                    <span className="font-medium">Nombre:</span>{" "}
                    {selectedOrder.customer_name}
                  </p>
                  <p className="text-foreground">
                    <span className="font-medium">Teléfono:</span>{" "}
                    {selectedOrder.customer_phone}
                  </p>
                  <p className="text-foreground">
                    <span className="font-medium">Dirección:</span>{" "}
                    {selectedOrder.customer_address}
                  </p>
                  {selectedOrder.customer_notes && (
                    <p className="text-foreground">
                      <span className="font-medium">Notas:</span>{" "}
                      {selectedOrder.customer_notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Productos
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted/30 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden">
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            x{item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium text-foreground">
                        ${(item.price * item.quantity).toLocaleString("es-CO")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-lg font-medium text-foreground">Total</span>
                <span className="text-2xl font-bold text-gold">
                  ${selectedOrder.total.toLocaleString("es-CO")}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    openWhatsApp(
                      selectedOrder.customer_phone,
                      selectedOrder.customer_name
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-neon hover:bg-neon/90 text-background font-semibold py-3 rounded-lg transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  Contactar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
