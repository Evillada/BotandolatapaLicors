"use client"

import { useState } from "react"
import { AgeVerificationModal } from "@/components/age-verification-modal"
import { Hero } from "@/components/hero"
import { Catalog } from "@/components/catalog"
import { PremiumFeatures } from "@/components/premium-features"
import { Promotions } from "@/components/promotions"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function Home() {
  const [isVerified, setIsVerified] = useState(false)
  const [showModal, setShowModal] = useState(true)

  const handleVerify = () => {
    setIsVerified(true)
    setShowModal(false)
  }

  const handleDeny = () => {
    window.location.href = "https://www.google.com"
  }

  return (
    <main className="min-h-screen bg-background">
      {showModal && <AgeVerificationModal onVerify={handleVerify} onDeny={handleDeny} />}

      {isVerified && (
        <>
          <Hero />
          <Catalog />
          <PremiumFeatures />
          <Promotions />
          <ContactSection />
          <Footer />
          <WhatsAppButton />
        </>
      )}
    </main>
  )
}
