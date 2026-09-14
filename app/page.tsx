"use client"

import { useEffect, useState } from "react"
import { AgeVerificationModal } from "@/components/age-verification-modal"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { AboutSection } from "@/components/about-section"
import { Catalog } from "@/components/catalog"
import { PremiumFeatures } from "@/components/premium-features"
import { Promotions } from "@/components/promotions"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { CartButton, CartDrawer } from "@/components/cart"
import { Toaster } from "sonner"

const SESSION_KEY = "btl_age_ok"

export default function Home() {
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setIsVerified(true)
    }
  }, [])

  const handleVerify = () => {
    sessionStorage.setItem(SESSION_KEY, "1")
    setIsVerified(true)
  }

  const handleDeny = () => {
    window.location.href = "https://www.google.com"
  }

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Toaster position="top-center" richColors />

      {/* Modal siempre como overlay — el contenido se carga siempre en background */}
      {!isVerified && (
        <AgeVerificationModal onVerify={handleVerify} onDeny={handleDeny} />
      )}

      {/* Contenido siempre montado para que las APIs arranquen de inmediato */}
      <div
        className={`transition-opacity duration-500 ${
          isVerified ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isVerified}
      >
        <Header />
          <Hero />
          <AboutSection />
          <Catalog />
        <PremiumFeatures />
        <Promotions />
        <ContactSection />
        <Footer />
        <WhatsAppButton />
        <CartButton />
        <CartDrawer />
      </div>
    </main>
  )
}
