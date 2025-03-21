/** @type {import('next').NextConfig} */
const nextConfig = {
  // Setting this to false can help with dynamic routes
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
}

module.exports = nextConfig 