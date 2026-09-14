"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Eye, EyeOff, Loader2, X, Tag } from "lucide-react"
import type { Category } from "@/lib/supabase/types"
import { toast } from "sonner"

type FormState = {
  name: string
  icon: string
}

const emptyForm: FormState = { name: "", icon: "" }

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormState>(emptyForm)

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories?all=true")
      const json = await res.json()
      setCategories(json.data ?? [])
    } catch {
      toast.error("Error al cargar categorías")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: slugify(formData.name.trim()),
          icon: formData.icon.trim() || null,
          active: true,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Error al crear categoría")
      }
      toast.success("Categoría creada")
      setIsModalOpen(false)
      setFormData(emptyForm)
      await fetchCategories()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear categoría")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function toggleActive(category: Category) {
    setTogglingId(category.id)
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !category.active }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Error al actualizar")
      }
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, active: !c.active } : c))
      )
      toast.success(category.active ? "Categoría ocultada" : "Categoría visible")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar categoría")
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`¿Eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(category.id)
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Error al eliminar")
      }
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
      toast.success("Categoría eliminada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar categoría")
    } finally {
      setDeletingId(null)
    }
  }

  const activeCount = categories.filter((c) => c.active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorías</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} total · {activeCount} visibles en el catálogo
          </p>
        </div>
        <button
          onClick={() => { setFormData(emptyForm); setIsModalOpen(true) }}
          className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-background hover:bg-gold/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Tag className="h-12 w-12 opacity-30" />
            <p>No hay categorías creadas</p>
            <button
              onClick={() => { setFormData(emptyForm); setIsModalOpen(true) }}
              className="text-sm text-gold hover:underline"
            >
              Crear la primera categoría
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Slug</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Icono</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{cat.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cat.icon ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          cat.active
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${cat.active ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                        {cat.active ? "Visible" : "Oculta"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle visibility */}
                        <button
                          onClick={() => toggleActive(cat)}
                          disabled={togglingId === cat.id}
                          title={cat.active ? "Ocultar del catálogo" : "Mostrar en el catálogo"}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                        >
                          {togglingId === cat.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : cat.active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={deletingId === cat.id}
                          title="Eliminar categoría"
                          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          {deletingId === cat.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New category modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-bold text-foreground">Nueva Categoría</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nombre <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Whisky"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                  required
                  autoFocus
                />
                {formData.name && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Slug: <span className="font-mono">{slugify(formData.name)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Icono (emoji, opcional)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="Ej: 🥃"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-background hover:bg-gold/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
