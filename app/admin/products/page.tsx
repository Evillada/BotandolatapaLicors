"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, Pencil, Trash2, Search, Loader2, Upload, X } from "lucide-react"
import type { Product, ProductInsert } from "@/lib/supabase/types"
import { toast } from "sonner"

type FormState = {
  name: string
  description: string
  price: string
  original_price: string
  discount: string
  category: string
  size: string
  image_url: string
  badge: string
  stock: string
  active: boolean
  is_promotion: boolean
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  discount: "",
  category: "",
  size: "",
  image_url: "",
  badge: "",
  stock: "",
  active: true,
  is_promotion: false,
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<FormState>(emptyForm)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=100&all=true")
      const data = await res.json()
      setProducts(data.data || [])
    } catch (error) {
      toast.error("Error al cargar productos")
    } finally {
      setIsLoading(false)
    }
  }

  const toPayload = (): ProductInsert => ({
    name: formData.name.trim(),
    description: formData.description.trim() || null,
    price: formData.price === "" ? 0 : Number(formData.price),
    original_price: formData.original_price === "" ? null : Number(formData.original_price),
    discount: formData.discount === "" ? 0 : Number(formData.discount),
    category: formData.category || null,
    size: formData.size || null,
    image_url: formData.image_url || null,
    badge: formData.badge || null,
    stock: formData.stock === "" ? 0 : Number(formData.stock),
    active: formData.active,
    is_promotion: formData.is_promotion,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }
    const price = formData.price === "" ? 0 : Number(formData.price)
    if (Number.isNaN(price) || price < 0) {
      toast.error("Precio inválido")
      return
    }
    setIsSubmitting(true)

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products"
      const method = editingProduct ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload()),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar")
      }

      toast.success(
        editingProduct ? "Producto actualizado" : "Producto creado"
      )
      setIsModalOpen(false)
      setEditingProduct(null)
      setFormData(emptyForm)
      fetchProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes (JPG, PNG, WebP)")
      return
    }
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.set("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al subir")
      setFormData((prev) => ({ ...prev, image_url: data.url }))
      toast.success("Imagen subida")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir la imagen")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      toast.success("Producto eliminado")
      fetchProducts()
    } catch (error) {
      toast.error("Error al eliminar el producto")
    }
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price === 0 ? "" : String(product.price),
      original_price: product.original_price == null ? "" : String(product.original_price),
      discount: product.discount === 0 ? "" : String(product.discount),
      category: product.category || "",
      size: product.size || "",
      image_url: product.image_url || "",
      badge: product.badge || "",
      stock: product.stock === 0 ? "" : String(product.stock),
      active: product.active,
      is_promotion: product.is_promotion,
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setFormData(emptyForm)
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu catálogo de productos
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingProduct(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 bg-gold hover:bg-gold-light text-background font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Producto
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Categoría
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Precio
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Stock
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.size}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-foreground">
                    {product.category}
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-foreground">
                      ${product.price.toLocaleString("es-CO")}
                    </p>
                    {product.original_price && (
                      <p className="text-sm text-muted-foreground line-through">
                        ${product.original_price.toLocaleString("es-CO")}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4 text-foreground">{product.stock}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.active
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {product.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No se encontraron productos
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Precio *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Precio Original (para descuentos)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({ ...formData, original_price: e.target.value })
                    }
                    placeholder="Opcional"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={formData.category || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Whisky">Whisky</option>
                    <option value="Vodka">Vodka</option>
                    <option value="Tequila">Tequila</option>
                    <option value="Gin">Gin</option>
                    <option value="Ron">Ron</option>
                    <option value="Champagne">Champagne</option>
                    <option value="Aguardiente">Aguardiente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Tamaño
                  </label>
                  <input
                    type="text"
                    value={formData.size || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, size: e.target.value })
                    }
                    placeholder="750ml"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Imagen del producto
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {isUploading ? "Subiendo..." : "Subir imagen"}
                      </button>
                      {formData.image_url && (
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, image_url: "" }))}
                          className="p-2.5 rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Quitar imagen"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {formData.image_url ? (
                      <div className="relative h-24 w-24 rounded-lg border border-border overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={formData.image_url}
                          alt="Vista previa"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG o WebP. Las imágenes se guardan en Supabase Storage (bucket &quot;products&quot;).
                      </p>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="O pega aquí una URL de imagen"
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value })
                    }
                    placeholder="Premium, Bestseller..."
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="rounded border-border text-gold focus:ring-gold"
                    />
                    <span className="text-sm text-foreground">Activo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_promotion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_promotion: e.target.checked,
                        })
                      }
                      className="rounded border-border text-gold focus:ring-gold"
                    />
                    <span className="text-sm text-foreground">
                      Es promoción
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingProduct(null)
                  }}
                  className="px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-gold hover:bg-gold-light text-background font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingProduct ? "Guardar Cambios" : "Crear Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
