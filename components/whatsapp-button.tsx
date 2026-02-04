"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/573001234567?text=Hola,%20quiero%20hacer%20un%20pedido"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl group"
      aria-label="Contactar por WhatsApp"
      style={{
        boxShadow: "0 0 30px rgba(37, 211, 102, 0.4), 0 0 60px rgba(37, 211, 102, 0.2)",
      }}
    >
      <MessageCircle
        className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110"
        fill="white"
      />

      <span className="absolute h-full w-full rounded-full bg-[#25D366] opacity-40 animate-ping" />
      <span className="absolute h-[calc(100%+12px)] w-[calc(100%+12px)] rounded-full border-2 border-[#25D366]/30 animate-pulse" />
    </a>
  )
}
