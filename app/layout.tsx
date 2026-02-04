import type React from "react"
import type { Metadata } from "next"
import { Poppins, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "Botando la Tapa Licors | Licorería Premium en Medellín",
  description:
    "Licorería premium con delivery nocturno rápido en Medellín. Whisky, vodka, tequila, ron y más. Atención 24/7. Experiencia de compra exclusiva.",
  keywords: [
    "licorería premium",
    "delivery de licores",
    "licores Medellín",
    "whisky delivery",
    "licorería 24 horas",
    "licores a domicilio",
  ],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Botando la Tapa Licors | Licorería Premium",
    description: "Donde el sabor se vuelve experiencia. Delivery nocturno, rápido y con estilo.",
    type: "website",
    locale: "es_CO",
  },
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} ${montserrat.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
