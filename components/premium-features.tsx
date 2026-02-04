"use client"

import { Clock, Shield, Headphones, Gem, Sparkles } from "lucide-react"

const features = [
  {
    icon: Clock,
    title: "Entregas Rápidas",
    description: "Delivery en menos de 45 minutos en toda la ciudad",
    gradient: "from-gold/30 to-gold/10",
  },
  {
    icon: Shield,
    title: "Licores Originales",
    description: "100% garantía de autenticidad en todos nuestros productos",
    gradient: "from-neon/30 to-neon/10",
  },
  {
    icon: Headphones,
    title: "Atención 24/7",
    description: "Estamos disponibles para ti a cualquier hora del día",
    gradient: "from-purple-glow/30 to-purple-glow/10",
  },
  {
    icon: Gem,
    title: "Experiencia Premium",
    description: "Servicio exclusivo para clientes exigentes",
    gradient: "from-gold/30 to-gold/10",
  },
]

export function PremiumFeatures() {
  return (
    <section className="relative overflow-hidden bg-card px-4 py-24">
      <div className="noise-texture absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(199,168,107,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(199,168,107,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-gold/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gradient-to-r from-gold/15 via-gold/10 to-gold/15 px-5 py-2 text-sm font-medium text-gold backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span className="tracking-wider uppercase">¿Por qué elegirnos?</span>
          </span>
          <h2 className="mb-6 font-serif text-4xl font-black text-foreground sm:text-5xl md:text-6xl tracking-tight">
            La Diferencia{" "}
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              Premium
            </span>
          </h2>
          {/* Decorative line */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="h-2 w-2 rotate-45 bg-gold" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-border/50 bg-gradient-to-b from-background to-card p-8 text-center transition-all duration-500 hover:border-gold/50 hover:shadow-2xl hover:shadow-gold/10 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-gold/30 bg-gradient-to-br ${feature.gradient} transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-gold/30 group-hover:border-gold/60`}
              >
                <feature.icon className="h-10 w-10 text-gold transition-transform duration-500 group-hover:scale-110" />
              </div>

              <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-gold transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 bg-gradient-to-r from-gold/0 via-gold to-gold/0 rounded-full transition-all duration-500 group-hover:w-16" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
