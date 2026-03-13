"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import { useCartStore, type CartItem as CartItemType } from "@/lib/stores/cart-store"
import { motion } from "framer-motion"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()
  const { product, quantity } = item

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-4 rounded-xl border border-border/50 bg-card/50 p-4"
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4 className="font-semibold text-foreground line-clamp-1">{product.name}</h4>
          <p className="text-sm text-muted-foreground">{product.size}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-gold">
              ${(product.price * quantity).toLocaleString("es-CO")}
            </span>
            <button
              onClick={() => removeItem(product.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
