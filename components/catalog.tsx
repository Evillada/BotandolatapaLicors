"use client"

import { useEffect, useRef, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { Sparkles } from "lucide-react"
import type { Category, Product } from "@/lib/supabase/types"

export function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(["Todos"])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("Todos")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const names = (data.data ?? []).map((c: Category) => c.name)
        setCategories(["Todos", ...names])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/products?limit=50")
      .then((res) => res.json())
      .then((data) => {
        const list = data.data ?? []
        setProducts(list.filter((p: Product) => !p.is_promotion))
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered =
    activeCategory === "Todos"
      ? products
      : products.filter(
          (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
        )

  return (
    <section id="catalogo" className="relative bg-background px-4 py-12 sm:py-24 overflow-hidden">
      <div className="noise-texture absolute inset-0 pointer-events-none" />

      <div className="pointer-events-none absolute left-0 top-1/4 h-[150px] w-[150px] sm:h-[500px] sm:w-[500px] rounded-full bg-purple-club/20 blur-[50px] sm:blur-[150px]" />
      <div className="pointer-events-none absolute right-0 bottom-1/4 h-[120px] w-[120px] sm:h-[400px] sm:w-[400px] rounded-full bg-gold/10 blur-[40px] sm:blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gradient-to-r from-gold/15 via-gold/10 to-gold/15 px-5 py-2 text-sm font-medium text-gold backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span className="tracking-wider uppercase">Catálogo Premium</span>
          </span>
          <h2 className="mb-6 font-serif text-4xl font-black text-foreground sm:text-5xl md:text-6xl tracking-tight">
            Nuestra{" "}
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              Colección
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Los mejores licores seleccionados para los paladares más exigentes
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="h-2 w-2 rotate-45 bg-gold" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-gold text-background shadow-lg shadow-gold/30"
                  : "border border-border bg-card text-muted-foreground hover:border-gold/60 hover:text-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No hay productos en esta categoría por el momento.
          </p>
        ) : (
          <div className="relative -mx-4 sm:mx-0">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory px-4
                         sm:px-0 sm:overflow-x-visible sm:grid sm:gap-8
                         sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {filtered.map((product, index) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[75vw] max-w-[280px] snap-start
                             sm:flex-shrink sm:w-auto sm:max-w-none"
                >
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
