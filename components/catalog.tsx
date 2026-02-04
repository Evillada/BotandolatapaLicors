"use client"

import { products } from "@/data/products"
import { ProductCard } from "@/components/product-card"
import { Sparkles } from "lucide-react"

export function Catalog() {
  return (
    <section id="catalogo" className="relative bg-background px-4 py-24 overflow-hidden">
      <div className="noise-texture absolute inset-0 pointer-events-none" />

      <div className="pointer-events-none absolute left-0 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-club/20 blur-[150px]" />
      <div className="pointer-events-none absolute right-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-gold/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
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
          {/* Decorative line */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="h-2 w-2 rotate-45 bg-gold" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
