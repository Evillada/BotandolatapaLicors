"use client"

import { MessageCircle, Phone } from "lucide-react"
import { AddToCartButton } from "@/components/cart"
import type { Product as SupabaseProduct } from "@/lib/supabase/types"
import type { Product as LegacyProduct } from "@/data/products"

type Product = SupabaseProduct | LegacyProduct

interface ProductCardProps {
  product: Product
  index?: number
}

function isSupabaseProduct(product: Product): product is SupabaseProduct {
  return 'image_url' in product
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const imageUrl = isSupabaseProduct(product) ? product.image_url : product.image
  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa el producto: ${product.name} - $${product.price.toLocaleString()}`,
  )

  const cartProduct: SupabaseProduct = isSupabaseProduct(product) 
    ? product 
    : {
        id: String(product.id),
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: null,
        discount: 0,
        category_id: null,
        category: product.category,
        size: product.size,
        image_url: product.image,
        badge: product.badge || null,
        stock: 100,
        active: true,
        is_promotion: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card to-background transition-all duration-500 hover:border-gold/60 hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-2 animate-fade-in light-sweep"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl ring-2 ring-inset ring-gold/50" />
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-gold/20 via-transparent to-neon/10" />
      </div>

      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        {product.badge && (
          <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-neon to-neon-light px-4 py-1.5 text-xs font-bold text-background shadow-lg shadow-neon/40 animate-neon-pulse">
            {product.badge}
          </span>
        )}
      </div>

      <div className="relative p-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold/80">{product.category}</span>
        <h3 className="mb-2 mt-2 text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-gold">
          {product.name}
        </h3>
        <p className="mb-5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>

        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Precio</span>
            <p className="font-serif text-3xl font-bold bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
              ${product.price.toLocaleString()}
            </p>
          </div>
          <span className="text-sm text-muted-foreground font-medium px-3 py-1 rounded-full bg-muted/50">
            {product.size}
          </span>
        </div>

        <div className="flex gap-3">
          <AddToCartButton product={cartProduct} />
          <a
            href={`https://wa.me/573176614939?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-neon-light px-4 py-3 font-semibold text-background transition-all duration-300 hover:shadow-xl hover:shadow-neon/40 hover:scale-[1.02]"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <a
            href="tel:+573176614939"
            className="flex items-center justify-center rounded-xl border-2 border-gold/50 px-4 py-3 text-gold transition-all duration-300 hover:bg-gold hover:text-background hover:border-gold hover:shadow-lg hover:shadow-gold/30"
          >
            <Phone className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
