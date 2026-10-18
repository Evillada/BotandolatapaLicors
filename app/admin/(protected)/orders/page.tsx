"use client"

import { useEffect, useState } from "react"
import { Search, MessageCircle, Eye, X, ChevronDown, Plus, Trash2, Loader2 } from "lucide-react"
import type { Order, OrderStatus, Product } from "@/lib/supabase/types"
import { toast } from "sonner"

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pendiente", color: "bg-yellow-500/10 text-yellow-500" },
  { value: "confirmed", label: "Confirmado", color: "bg-blue-500/10 text-blue-500" },
  { value: "preparing", label: "Preparando", color: "bg-purple-500/10 text-purple-500" },
  { value: "delivered", label: "Entregado", color: "bg-green-500/10 text-green-500" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-500/10 text-red-500" },
]

type OrderItem = { id: string; name: string; price: number; quantity: number; image_url: string | null }

type NewOrderForm = {
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_notes: string
  delivery_fee: string
  discount: string
  items: OrderItem[]
}

const emptyForm: NewOrderForm = {
  customer_name: "",
  customer_phone: "",
  customer_address: "",
  customer_notes: "",
  delivery_fee: "0",
  discount: "0",
  items: [],
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
  const [newOrder, setNewOrder] = useState<NewOrderForm>(emptyForm)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchOrders()
    fetchProducts()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders?limit=100")
      const data = await res.json()
      setOrders(data.data || [])
    } catch {
      toast.error("Error al cargar pedidos")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=100&all=true")
      const data = await res.json()
      setProducts(data.data || [])
    } catch {
      // silent
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success("Estado actualizado")
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status })
    } catch {
      toast.error("Error al actualizar el estado")
    }
  }

  const addItemToOrder = () => {
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return
    const existing = newOrder.items.find((i) => i.id === product.id)
    if (existing) {
      setNewOrder((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }))
    } else {
      setNewOrder((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          { id: product.id, name: product.name, price: product.price, quantity: 1, image_url: product.image_url },
        ],
      }))
    }
    setSelectedProductId("")
  }

  const updateItemQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setNewOrder((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }))
    } else {
      setNewOrder((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
      }))
    }
  }

  const subtotal = newOrder.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee = Number(newOrder.delivery_fee) || 0
  const discount = Math.max(0, Number(newOrder.discount) || 0)
  const total = Math.max(0, subtotal + deliveryFee - discount)

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrder.customer_name.trim() || !newOrder.customer_phone.trim() || !newOrder.customer_address.trim()) {
      toast.error("Nombre, teléfono y dirección son obligatorios")
      return
    }
    if (newOrder.items.length === 0) {
      toast.error("Agrega al menos un producto al pedido")
      return
    }
    setIsCreating(true)
    try {
      const payload = {
        customer_name: newOrder.customer_name.trim(),
        customer_phone: newOrder.customer_phone.trim(),
        customer_address: newOrder.customer_address.trim(),
        customer_notes: newOrder.customer_notes.trim() || null,
        items: newOrder.items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image_url: i.image_url,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        total,
        status: "pending",
      }
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al crear el pedido")
      toast.success("Pedido creado correctamente")
      setIsNewOrderOpen(false)
      setNewOrder(emptyForm)
      fetchOrders()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear el pedido")
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusOption = (status: OrderStatus) =>
    statusOptions.find((s) => s.value === status) || statusOptions[0]

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

  const allVisibleSelected =
    filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.has(o.id))

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) filteredOrders.forEach((o) => next.delete(o.id))
      else filteredOrders.forEach((o) => next.add(o.id))
      return next
    })
  }

  const deleteSelected = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setIsDeleting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al eliminar pedidos")
      setOrders((prev) => prev.filter((o) => !selectedIds.has(o.id)))
      if (selectedOrder && selectedIds.has(selectedOrder.id)) setSelectedOrder(null)
      setSelectedIds(new Set())
      setIsConfirmDeleteOpen(false)
      toast.success(ids.length === 1 ? "Pedido eliminado" : `${ids.length} pedidos eliminados`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar pedidos")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground mt-1">Gestiona los pedidos de tus clientes</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold px-4 py-2.5 rounded-lg border border-destructive/30 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              Eliminar ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => { setNewOrder(emptyForm); setIsNewOrderOpen(true) }}
            className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-background font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nuevo Pedido
          </button>
        </div>
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
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-4 pl-4 pr-0 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    aria-label="Seleccionar todos"
                    className="h-4 w-4 cursor-pointer accent-gold"
                  />
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground"># Pedido</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const status = getStatusOption(order.status)
                return (
                  <tr
                    key={order.id}
                    className={`border-b border-border/50 last:border-0 hover:bg-muted/20 ${selectedIds.has(order.id) ? "bg-destructive/5" : ""}`}
                  >
                    <td className="py-4 pl-4 pr-0 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        aria-label={`Seleccionar pedido #${order.order_number}`}
                        className="h-4 w-4 cursor-pointer accent-gold"
                      />
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground">#{order.order_number}</td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-foreground">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground">
                      ${order.total.toLocaleString("es-CO")}
                    </td>
                    <td className="py-4 px-4">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`appearance-none pr-8 pl-3 py-1.5 rounded-full text-xs font-medium cursor-pointer ${status.color} border-0 focus:outline-none focus:ring-2 focus:ring-gold`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("es-CO", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
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
                          onClick={() => openWhatsApp(order.customer_phone, order.customer_name)}
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

      {/* Confirm Delete Modal */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Eliminar {selectedIds.size === 1 ? "pedido" : `${selectedIds.size} pedidos`}
              </h2>
            </div>
            <p className="text-muted-foreground">
              Esta acción no se puede deshacer. Los pedidos seleccionados se borrarán permanentemente.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={deleteSelected}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Pedido #{selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Información del Cliente</h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <p className="text-foreground"><span className="font-medium">Nombre:</span> {selectedOrder.customer_name}</p>
                  <p className="text-foreground"><span className="font-medium">Teléfono:</span> {selectedOrder.customer_phone}</p>
                  <p className="text-foreground"><span className="font-medium">Dirección:</span> {selectedOrder.customer_address}</p>
                  {selectedOrder.customer_notes && (
                    <p className="text-foreground"><span className="font-medium">Notas:</span> {selectedOrder.customer_notes}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Productos</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden">
                          <img src={item.image_url || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-foreground">${(item.price * item.quantity).toLocaleString("es-CO")}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-lg font-medium text-foreground">Total</span>
                <span className="text-2xl font-bold text-gold">${selectedOrder.total.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => openWhatsApp(selectedOrder.customer_phone, selectedOrder.customer_name)}
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

      {/* New Order Modal */}
      {isNewOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Nuevo Pedido Manual</h2>
              <button onClick={() => setIsNewOrderOpen(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos del Cliente</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={newOrder.customer_name}
                      onChange={(e) => setNewOrder((p) => ({ ...p, customer_name: e.target.value }))}
                      placeholder="Nombre completo"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Teléfono *</label>
                    <input
                      type="tel"
                      required
                      value={newOrder.customer_phone}
                      onChange={(e) => setNewOrder((p) => ({ ...p, customer_phone: e.target.value }))}
                      placeholder="3XX XXX XXXX"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Dirección *</label>
                    <input
                      type="text"
                      required
                      value={newOrder.customer_address}
                      onChange={(e) => setNewOrder((p) => ({ ...p, customer_address: e.target.value }))}
                      placeholder="Dirección de entrega"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Notas (opcional)</label>
                    <textarea
                      rows={2}
                      value={newOrder.customer_notes}
                      onChange={(e) => setNewOrder((p) => ({ ...p, customer_notes: e.target.value }))}
                      placeholder="Instrucciones adicionales..."
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Productos</h3>
                <div className="flex gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${p.price.toLocaleString("es-CO")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addItemToOrder}
                    disabled={!selectedProductId}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gold hover:bg-gold/90 text-background font-semibold transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </button>
                </div>

                {newOrder.items.length > 0 && (
                  <div className="space-y-2 border border-border rounded-lg overflow-hidden">
                    {newOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            <img src={item.image_url || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">${item.price.toLocaleString("es-CO")} c/u</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.id, item.quantity - 1)}
                              className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors font-bold"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-foreground">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.id, item.quantity + 1)}
                              className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors font-bold"
                            >
                              +
                            </button>
                          </div>
                          <p className="w-24 text-right font-medium text-foreground text-sm">
                            ${(item.price * item.quantity).toLocaleString("es-CO")}
                          </p>
                          <button
                            type="button"
                            onClick={() => updateItemQty(item.id, 0)}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">${subtotal.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">Costo de envío</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={newOrder.delivery_fee}
                    onChange={(e) => setNewOrder((p) => ({ ...p, delivery_fee: e.target.value }))}
                    className="w-32 text-right px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    Descuento ($ pesos)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={newOrder.discount}
                    onChange={(e) => setNewOrder((p) => ({ ...p, discount: e.target.value }))}
                    className="w-32 text-right px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-background text-emerald-400 text-sm font-medium focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Descuento aplicado</span>
                    <span className="font-medium text-emerald-400">−${discount.toLocaleString("es-CO")}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-gold">${total.toLocaleString("es-CO")}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 flex items-center justify-center gap-2 bg-gold hover:bg-gold/90 text-background font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crear Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
