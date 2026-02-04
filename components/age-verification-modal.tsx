"use client"

import { useState } from "react"
import { Wine, Sparkles, ShieldCheck } from "lucide-react"

interface AgeVerificationModalProps {
  onVerify: () => void
  onDeny: () => void
}

export function AgeVerificationModal({ onVerify, onDeny }: AgeVerificationModalProps) {
  const [isExiting, setIsExiting] = useState(false)

  const handleVerify = () => {
    setIsExiting(true)
    setTimeout(onVerify, 600)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-700 ${isExiting ? "opacity-0" : "opacity-100"}`}
    >
      {/* Animated background with luxury gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card">
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 animate-pulse rounded-full bg-gold/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Luxury glow effects */}
        <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 translate-x-1/2 translate-y-1/2 rounded-full bg-neon/10 blur-[100px]" />
      </div>

      {/* Modal card */}
      <div
        className={`relative mx-4 w-full max-w-lg transform transition-all duration-700 ${isExiting ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
      >
        {/* Outer glow ring */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-gold/50 via-neon/30 to-gold/50 opacity-75 blur-sm" />

        {/* Card content */}
        <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-card/95 p-10 shadow-2xl backdrop-blur-xl">
          {/* Top decorative line */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

          {/* Corner accents */}
          <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-gold/50" />
          <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-gold/50" />
          <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-gold/50" />
          <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-gold/50" />

          {/* Content */}
          <div className="relative text-center">
            {/* Animated icon */}
            <div className="relative mx-auto mb-8">
              <div className="absolute inset-0 mx-auto h-28 w-28 animate-pulse rounded-full bg-gold/20 blur-xl" />
              <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
                {/* Rotating ring */}
                <div
                  className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold"
                  style={{ animationDuration: "3s" }}
                />
                <div
                  className="absolute inset-2 animate-spin rounded-full border border-transparent border-b-neon"
                  style={{ animationDuration: "4s", animationDirection: "reverse" }}
                />

                {/* Center icon */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/60 bg-gradient-to-br from-gold/20 to-transparent">
                  <Wine className="h-10 w-10 text-gold" />
                </div>
              </div>

              {/* Sparkles */}
              <Sparkles className="absolute -right-2 top-0 h-5 w-5 animate-pulse text-gold" />
              <Sparkles
                className="absolute -left-2 bottom-4 h-4 w-4 animate-pulse text-neon"
                style={{ animationDelay: "0.5s" }}
              />
            </div>

            {/* Brand name */}
            <p className="mb-2 font-sans text-sm font-medium uppercase tracking-[0.3em] text-gold">
              Botando la Tapa Licors
            </p>

            {/* Title */}
            <h2 className="mb-4 font-serif text-4xl font-bold tracking-tight text-foreground">Verificación de Edad</h2>

            {/* Decorative divider */}
            <div className="mx-auto mb-6 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/60" />
              <ShieldCheck className="h-5 w-5 text-gold" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/60" />
            </div>

            {/* Description */}
            <p className="mx-auto mb-10 max-w-xs text-base leading-relaxed text-muted-foreground">
              Para acceder a nuestro catálogo exclusivo de licores premium, confirma que eres{" "}
              <span className="font-semibold text-gold">mayor de 18 años</span>
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={handleVerify}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-gold to-gold-light px-10 py-4 font-semibold text-background shadow-lg shadow-gold/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-gold/40"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Soy Mayor de 18 Años
                </span>
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>

              <button
                onClick={onDeny}
                className="group rounded-xl border-2 border-muted-foreground/30 px-10 py-4 font-semibold text-muted-foreground transition-all duration-300 hover:border-neon hover:bg-neon/10 hover:text-neon"
              >
                Soy Menor de Edad
              </button>
            </div>

            {/* Legal text */}
            <div className="mt-10 space-y-2 border-t border-muted-foreground/20 pt-6">
              <p className="text-xs leading-relaxed text-muted-foreground/70">
                Al continuar, confirmas que tienes la edad legal para consumir bebidas alcohólicas en tu país de
                residencia y aceptas nuestros términos y condiciones.
              </p>
              <p className="text-xs font-medium text-muted-foreground/50">
                El consumo excesivo de alcohol es perjudicial para la salud
              </p>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon/50 to-transparent" />
        </div>
      </div>
    </div>
  )
}
