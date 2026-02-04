"use client"

import { MessageCircle, Phone, MapPin, Clock } from "lucide-react"

export function ContactSection() {
  return (
    <section className="relative bg-card px-4 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-sm text-gold">
          Contáctanos
        </span>
        <h2 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
          ¿Listo para <span className="text-gold">Ordenar</span>?
        </h2>
        <p className="mb-10 text-muted-foreground">
          Estamos a un mensaje de distancia. Contáctanos ahora y recibe tu pedido en minutos.
        </p>

        {/* Contact buttons */}
        <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="https://wa.me/573001234567?text=Hola,%20quiero%20hacer%20un%20pedido"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-xl bg-neon px-10 py-5 font-bold text-background transition-all hover:shadow-xl hover:shadow-neon/30"
          >
            <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
              <MessageCircle className="h-6 w-6" />
              Pedir por WhatsApp
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </a>

          <a
            href="tel:+573001234567"
            className="flex items-center justify-center gap-3 rounded-xl border-2 border-gold px-10 py-5 text-lg font-bold text-gold transition-all hover:bg-gold hover:text-background hover:shadow-xl hover:shadow-gold/30"
          >
            <Phone className="h-6 w-6" />
            Llamar Ahora
          </a>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-6">
            <MapPin className="mx-auto mb-3 h-8 w-8 text-gold" />
            <h3 className="mb-1 font-semibold text-foreground">Ubicación</h3>
            <p className="text-sm text-muted-foreground">Medellín, Colombia</p>
          </div>

          <div className="rounded-xl border border-border bg-background p-6">
            <Clock className="mx-auto mb-3 h-8 w-8 text-gold" />
            <h3 className="mb-1 font-semibold text-foreground">Horario</h3>
            <p className="text-sm text-muted-foreground">24 horas, 7 días</p>
          </div>

          <div className="rounded-xl border border-border bg-background p-6">
            <Phone className="mx-auto mb-3 h-8 w-8 text-gold" />
            <h3 className="mb-1 font-semibold text-foreground">Teléfono</h3>
            <p className="text-sm text-muted-foreground">+57 300 123 4567</p>
          </div>
        </div>
      </div>
    </section>
  )
}
