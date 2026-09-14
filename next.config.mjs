/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Acepta cualquier URL https (Supabase storage, CDNs, etc.)
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [390, 640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
  },
}

export default nextConfig
