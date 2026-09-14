"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/50 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gold/40 group-hover:border-gold transition-colors duration-300">
            <Image
              src="/favicon.png"
              alt="Botando la Tapa Licors"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="hidden sm:block font-serif font-bold text-foreground group-hover:text-gold transition-colors duration-300 tracking-wide">
            Botando la Tapa
            <span className="ml-1.5 text-gold">Licors</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="#catalogo"
            className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors duration-200"
          >
            Catálogo
          </Link>
          <Link
            href="#promociones"
            className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors duration-200"
          >
            Promociones
          </Link>
          <Link
            href="#contacto"
            className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors duration-200"
          >
            Contacto
          </Link>
        </nav>
      </div>
    </header>
  )
}
