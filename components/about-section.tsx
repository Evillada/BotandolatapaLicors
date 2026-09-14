"use client"

import { Star, Zap, Shield, MapPin } from "lucide-react"

const values = [
  {
    icon: Star,
    title: "Calidad Premium",
    desc: "Solo trabajamos con licores de primera calidad, importados y nacionales, cuidadosamente seleccionados para tu disfrute.",
  },
  {
    icon: Zap,
    title: "Rapidez garantizada",
    desc: "Sabemos que el momento no espera. Nuestros domiciliarios están listos para llevarte lo que necesitas en el menor tiempo posible.",
  },
  {
    icon: Shield,
    title: "Confianza y discreción",
    desc: "Tu pedido llega empacado con discreción y sin contratiempos. Atención personalizada en cada entrega.",
  },
]

export function AboutSection() {
  return (
    <section
      id="quienes-somos"
      className="relative bg-background px-4 py-14 sm:py-24 overflow-hidden"
    >
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-[120px] w-[120px] sm:h-[400px] sm:w-[400px] rounded-full bg-gold/8 blur-[50px] sm:blur-[130px]" />
        <div className="absolute right-0 bottom-0 h-[100px] w-[100px] sm:h-[350px] sm:w-[350px] rounded-full bg-purple-club/20 blur-[40px] sm:blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 sm:mb-14 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gradient-to-r from-gold/15 via-gold/10 to-gold/15 px-5 py-2 text-sm font-medium text-gold backdrop-blur-sm">
            <Star className="h-4 w-4" />
            <span className="tracking-wider uppercase">Quiénes Somos</span>
          </span>
          <h2 className="mt-4 mb-4 font-serif text-3xl font-black text-foreground sm:text-5xl md:text-6xl tracking-tight">
            Más que una{" "}
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              licorería
            </span>
          </h2>
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="h-2 w-2 rotate-45 bg-gold" />
            <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
        </div>

        {/* Story */}
        <div className="mb-10 sm:mb-16 max-w-3xl mx-auto text-center space-y-4">
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            En <span className="text-gold font-semibold">Botando la Tapa Licors</span> nacimos con una misión clara: llevar los mejores licores del mercado directamente a tu puerta, sin complicaciones y con la velocidad que mereces.
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Somos una licorería <span className="text-foreground font-medium">100% medellínense</span>, apasionados por los buenos momentos y por hacer que cada celebración, reunión o noche especial sea perfecta. Nuestro catálogo incluye whisky, vodka, tequila, ron, gin, aguardiente y más.
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            No importa si es de día o de noche —{" "}
            <span className="text-gold font-semibold">aquí estamos para servirte.</span>
          </p>
        </div>

        {/* Values */}
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-border/60 bg-card/60 p-6 text-center backdrop-blur-sm hover:border-gold/40 transition-colors duration-300"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
                <v.icon className="h-6 w-6 text-gold" />
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Coverage badge */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-gold/30" />
          <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-5 py-2.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-gold flex-shrink-0" />
            <span>Domicilio en <span className="text-gold font-semibold">Medellín y Área Metropolitana</span></span>
          </div>
          <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-gold/30" />
        </div>
      </div>
    </section>
  )
}
