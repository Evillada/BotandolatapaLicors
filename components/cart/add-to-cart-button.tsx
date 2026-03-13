"use client"

import { ShoppingCart, Check } from "lucide-react"
import { useState } from "react"
import { useCartStore } from "@/lib/stores/cart-store"
import type { Product } from "@/lib/supabase/types"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface AddToCartButtonProps {
  product: Product
  variant?: "default" | "compact"
}

export function AddToCartButton({ product, variant = "default" }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false)
  const { addItem } = useCartStore()

  const handleAdd = () => {
    addItem(product)
    setIsAdded(true)
    toast.success(`${product.name} agregado al carrito`)

    setTimeout(() => {
      setIsAdded(false)
    }, 1500)
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleAdd}
        disabled={isAdded}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold text-background transition-all hover:scale-105 hover:shadow-lg hover:shadow-gold/30 disabled:cursor-not-allowed"
      >
        <AnimatePresence mode="wait">
          {isAdded ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="cart"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <ShoppingCart className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isAdded}
      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-light px-4 py-3 font-semibold text-background transition-all duration-300 hover:shadow-xl hover:shadow-gold/40 hover:scale-[1.02] disabled:cursor-not-allowed"
    >
      <AnimatePresence mode="wait">
        {isAdded ? (
          <motion.div
            key="added"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="h-5 w-5" />
            <span>Agregado</span>
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Agregar</span>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
