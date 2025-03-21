/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard output for Vercel
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
    // Configure image sizes - expanded to include common gaming resolutions
    deviceSizes: [640, 750, 828, 1080, 1200, 1280, 1440, 1920, 2048, 2560, 3840, 4096],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    // Increase the image optimization buffer size to handle large images
    minimumCacheTTL: 3600, // 1 hour cache
    // Only allowed formats are 'image/webp' and 'image/avif'
    formats: ['image/webp', 'image/avif'],
    // Allow local images to be processed
    domains: ['localhost', 'vice.city'],
    // Increase memory limit for image optimization
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
  
  // Experimental features - removed invalid options
  experimental: {
    // Valid experimental options only
    largePageDataBytes: 128 * 1000, // 128KB
    serverComponentsExternalPackages: ['sharp'],
  },
}

module.exports = nextConfig 