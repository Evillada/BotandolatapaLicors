"use client"

import { X, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { CartItem } from "./cart-item"
import { CheckoutForm } from "./checkout-form"
import { motion, AnimatePresence } from "framer-motion"

export function CartDrawer() {
  const { items, isOpen, closeCart, getTotal, clearCart } = useCartStore()
  const total = getTotal()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-gold" />
                <h2 className="text-xl font-bold text-foreground">Tu Carrito</h2>
              </div>
              <button
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Agrega productos para comenzar tu pedido
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <CartItem key={item.product.id} item={item} />
                    ))}
                  </AnimatePresence>

                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full rounded-lg border border-destructive/30 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      Vaciar carrito
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-medium text-foreground">Total</span>
                  <span className="text-2xl font-bold text-gold">
                    ${total.toLocaleString("es-CO")}
                  </span>
                </div>

                <CheckoutForm onSuccess={closeCart} />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
