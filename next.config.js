/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use 'serverless' output for better Vercel compatibility
  output: 'standalone',
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google user profile photos
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com', // Discord user profile photos
        pathname: '**',
      },
    ],
    // Configure image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Increase the image optimization buffer size to handle large images
    minimumCacheTTL: 60,
    // Important: allow local images to be optimized
    domains: ['localhost', 'vice.city'],
    // Use AVIF format when possible for better compression
    formats: ['image/avif', 'image/webp'],
  },
  
  // Disable strict mode in production to avoid double-rendering issues
  reactStrictMode: process.env.NODE_ENV === 'development',
  
  // Configure redirects, headers, etc. if needed
  async rewrites() {
    return [];
  },
  
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Configure modularizeImports if needed
  modularizeImports: {
    '@heroicons/react': {
      transform: '@heroicons/react/{{member}}',
    },
  },
  
  // Optimize serverless function size
  experimental: {
    // Don't include Sharp in server components
    serverComponentsExternalPackages: [],
    // Use the native Next.js image optimizer instead
    optimizeImages: true,
    // Exclude unnecessary files from traces
    outputFileTracingExcludes: {
      '*': [
        '**/*.test.*',
        '**/*.spec.*',
        '**/tests/**',
        '**/__tests__/**',
      ],
    },
  },
}

module.exports = nextConfig 