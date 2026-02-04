"use client"

import { Flame, MessageCircle, Zap } from "lucide-react"
import { promotions } from "@/data/products"

export function Promotions() {
  return (
    <section className="relative bg-background px-4 py-24 overflow-hidden">
      <div className="noise-texture absolute inset-0 pointer-events-none" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-neon/15 blur-[180px]" />
        <div className="absolute left-0 bottom-0 h-[500px] w-[500px] rounded-full bg-purple-club/40 blur-[150px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gold/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="mb-6 inline-flex items-center gap-3 rounded-full border border-neon/50 bg-gradient-to-r from-neon/20 via-neon/10 to-neon/20 px-6 py-2.5 text-sm font-medium text-neon backdrop-blur-sm animate-neon-pulse">
            <Flame className="h-5 w-5" />
            <span className="tracking-wider uppercase">Ofertas Especiales</span>
            <Zap className="h-5 w-5" />
          </span>
          <h2 className="mb-6 font-serif text-4xl font-black text-foreground sm:text-5xl md:text-6xl tracking-tight">
            Promociones del{" "}
            <span className="bg-gradient-to-r from-neon via-neon-light to-neon bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(212,0,110,0.5)]">
              Día
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Aprovecha estas ofertas exclusivas por tiempo limitado
          </p>
          {/* Decorative line */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-neon/50" />
            <div className="h-2 w-2 rotate-45 bg-neon" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-neon/50" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo, index) => (
            <div
              key={promo.id}
              className="group relative overflow-hidden rounded-2xl border-2 border-neon/30 bg-gradient-to-br from-neon/10 via-purple-club/10 to-transparent p-1 transition-all duration-500 hover:border-neon hover:shadow-2xl hover:shadow-neon/30 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Inner card */}
              <div className="relative rounded-xl bg-gradient-to-br from-card via-background to-card p-6">
                <div className="absolute -right-10 -top-1 rotate-45 bg-gradient-to-r from-neon to-neon-light px-12 py-1.5 text-sm font-black text-background shadow-lg">
                  -{promo.discount}%
                </div>

                <div className="flex gap-5">
                  <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 p-1">
                    <div className="h-full w-full overflow-hidden rounded-lg">
                      <img
                        src={promo.image || "/placeholder.svg"}
                        alt={promo.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-semibold uppercase tracking-widest text-neon/80">
                      {promo.category}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-foreground group-hover:text-neon transition-colors">
                      {promo.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-sm text-muted-foreground line-through">
                        ${promo.originalPrice.toLocaleString()}
                      </span>
                      <span className="font-serif text-2xl font-black bg-gradient-to-r from-neon to-neon-light bg-clip-text text-transparent">
                        ${promo.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/573001234567?text=${encodeURIComponent(`Hola, me interesa la promoción: ${promo.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-neon to-neon-light px-4 py-3.5 font-semibold text-background transition-all duration-300 hover:shadow-xl hover:shadow-neon/40 hover:scale-[1.02]"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Pedir Ahora</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
