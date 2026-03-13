import type { CartItem } from '@/lib/stores/cart-store'

interface CustomerInfo {
  name: string
  phone: string
  address: string
  notes?: string
}

export function generateWhatsAppMessage(
  items: CartItem[],
  customer: CustomerInfo,
  total: number
): string {
  const itemsList = items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.product.name} - $${(item.product.price * item.quantity).toLocaleString('es-CO')}`
    )
    .join('\n')

  const message = `
🍾 *NUEVO PEDIDO - Botando la Tapa Licors*

📋 *Datos del Cliente:*
👤 Nombre: ${customer.name}
📱 Teléfono: ${customer.phone}
📍 Dirección: ${customer.address}
${customer.notes ? `📝 Notas: ${customer.notes}` : ''}

🛒 *Productos:*
${itemsList}

💰 *Total: $${total.toLocaleString('es-CO')}*

¡Gracias por tu pedido! 🙌
`.trim()

  return message
}

export function getWhatsAppUrl(message: string): string {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573176614939'
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
}
