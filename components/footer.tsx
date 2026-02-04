import { Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative border-t border-border/30 bg-background px-4 py-16 overflow-hidden">
      <div className="noise-texture absolute inset-0 pointer-events-none" />

      {/* Subtle ambient light */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[200px] w-[400px] rounded-full bg-gold/5 blur-[80px]" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-8">
          <h3 className="font-serif text-4xl font-black text-foreground mb-4 tracking-tight">
            Botando la Tapa{" "}
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              Licors
            </span>
          </h3>

          <div className="inline-flex items-center gap-3 text-gold/80">
            <Sparkles className="h-4 w-4" />
            <p className="text-lg font-medium italic tracking-wide">"Premium is not a price, it's a lifestyle."</p>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        {/* Decorative divider */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-gold/30" />
          <div className="h-1.5 w-1.5 rotate-45 bg-gold/50" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-gold/30" />
        </div>

        <div className="mx-auto max-w-2xl rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground/80">Aviso Legal:</strong> La venta de bebidas alcohólicas está prohibida
            a menores de 18 años. El consumo excesivo de alcohol es perjudicial para la salud. Ley 124 de 1994.
            Prohíbase el expendio de bebidas embriagantes a menores de edad.
          </p>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/60 tracking-wider uppercase">
          © {new Date().getFullYear()} Botando la Tapa Licors • Todos los derechos reservados
        </p>
      </div>
    </footer>
  )
}
