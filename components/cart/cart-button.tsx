"use client"

import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { motion, AnimatePresence } from "framer-motion"

export function CartButton() {
  const { toggleCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  return (
    <button
      onClick={toggleCart}
      className="fixed bottom-6 left-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold-light shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl group"
      aria-label="Abrir carrito"
      style={{
        boxShadow: "0 0 30px rgba(199, 168, 107, 0.4), 0 0 60px rgba(199, 168, 107, 0.2)",
      }}
    >
      <ShoppingCart className="h-7 w-7 text-background transition-transform duration-300 group-hover:scale-110" />
      
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-neon text-xs font-bold text-background"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </motion.span>
        )}
      </AnimatePresence>

      <span className="absolute h-full w-full rounded-full bg-gold opacity-30 animate-ping" />
    </button>
  )
}
