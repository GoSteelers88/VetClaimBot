/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simplified config for Railway deployment
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable experimental features for stability
  experimental: {
    turbo: undefined,
  },
  output: 'standalone',
}

module.exports = nextConfig