"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MessageCircle, Loader2 } from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { generateWhatsAppMessage, getWhatsAppUrl } from "@/lib/utils/whatsapp"
import { toast } from "sonner"

const checkoutSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  address: z.string().min(5, "La dirección es requerida"),
  notes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  onSuccess?: () => void
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { items, getTotal, clearCart } = useCartStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error("El carrito está vacío")
      return
    }

    setIsSubmitting(true)

    try {
      const total = getTotal()
      const message = generateWhatsAppMessage(items, data, total)
      const whatsappUrl = getWhatsAppUrl(message)

      // Save order to database
      const orderData = {
        customer_name: data.name,
        customer_phone: data.phone,
        customer_address: data.address,
        customer_notes: data.notes || null,
        items: items.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image_url: item.product.image_url,
        })),
        subtotal: total,
        delivery_fee: 0,
        total: total,
        status: 'pending' as const,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar el pedido')
      }

      // Open WhatsApp
      window.open(whatsappUrl, '_blank')

      // Clear cart and close
      clearCart()
      toast.success("¡Pedido enviado! Te contactaremos pronto.")
      onSuccess?.()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : "Error al procesar el pedido. Intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
          Nombre completo
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          placeholder="Tu nombre"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
          Teléfono / WhatsApp
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          placeholder="300 123 4567"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-foreground">
          Dirección de entrega
        </label>
        <input
          id="address"
          type="text"
          {...register("address")}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          placeholder="Calle, número, barrio"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-foreground">
          Notas adicionales (opcional)
        </label>
        <textarea
          id="notes"
          {...register("notes")}
          rows={2}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold resize-none"
          placeholder="Instrucciones especiales..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || items.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-neon px-6 py-4 font-semibold text-background transition-all hover:shadow-xl hover:shadow-neon/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            Enviar Pedido por WhatsApp
          </>
        )}
      </button>
    </form>
  )
}
