/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimized config for Railway deployment
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
  // Remove standalone for better CSS serving
  // output: 'standalone',
  
  // Ensure CSS and static assets are properly served
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Configure headers for static assets
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig