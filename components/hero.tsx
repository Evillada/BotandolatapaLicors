"use client"

import { useEffect, useState } from "react"
import { ChevronDown, MessageCircle, Sparkles } from "lucide-react"
import Link from "next/link"

export function Hero() {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      <div className="noise-texture absolute inset-0 pointer-events-none" />

      <div className="vignette absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-gold/15 blur-[150px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-purple-club/30 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-neon/5 blur-[200px]" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(199,168,107,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(199,168,107,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className={`mb-10 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <div className="flex items-center gap-3 rounded-full border border-gold/40 bg-gradient-to-r from-gold/15 via-gold/10 to-gold/15 px-6 py-2.5 text-sm font-medium text-gold backdrop-blur-sm animate-glow-pulse">
            <Sparkles className="h-4 w-4" />
            <span className="tracking-wider uppercase">Premium Liquor Experience</span>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        <h1
          className={`mb-8 text-center font-serif text-5xl font-black leading-none tracking-tight text-foreground sm:text-7xl md:text-8xl lg:text-9xl ${mounted ? "animate-fade-in" : "opacity-0"}`}
          style={{ animationDelay: "0.1s" }}
        >
          <span className="block text-balance mb-2">Botando la Tapa</span>
          <span className="block relative">
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(199,168,107,0.5)]">
              LICORS
            </span>
            {/* Neon underline accent */}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-neon to-transparent rounded-full" />
          </span>
        </h1>

        <p
          className={`mb-4 max-w-2xl text-center text-xl font-light text-foreground/90 sm:text-2xl md:text-3xl ${mounted ? "animate-fade-in" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          Donde el sabor se vuelve <span className="text-gold font-medium">experiencia</span>
        </p>

        <p
          className={`mb-12 text-center text-muted-foreground tracking-wide ${mounted ? "animate-fade-in" : "opacity-0"}`}
          style={{ animationDelay: "0.3s" }}
        >
          Delivery nocturno • Rápido • Con estilo
        </p>

        <div
          className={`flex flex-col gap-5 sm:flex-row ${mounted ? "animate-fade-in" : "opacity-0"}`}
          style={{ animationDelay: "0.4s" }}
        >
          <Link
            href="#catalogo"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-gold to-gold-light px-10 py-4 font-semibold text-background transition-all duration-300 hover:shadow-2xl hover:shadow-gold/40 hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-3 text-lg">
              <Sparkles className="h-5 w-5" />
              Ver Catálogo Premium
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>

          <a
            href="https://wa.me/573001234567?text=Hola,%20quiero%20hacer%20un%20pedido"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 rounded-xl border-2 border-neon bg-neon/10 px-10 py-4 font-semibold text-neon backdrop-blur-sm transition-all duration-300 hover:bg-neon hover:text-background hover:shadow-2xl hover:shadow-neon/40 hover:scale-105"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-lg">Pedir por WhatsApp</span>
          </a>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-gold/50">
            <span className="text-xs uppercase tracking-widest">Explora</span>
            <ChevronDown className="h-6 w-6 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  )
}
