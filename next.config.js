/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as standalone for production
  output: 'standalone',
  
  // Image optimization configuration
  images: {
    domains: ['localhost', 'vice.city'],
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
      {
        protocol: 'http',
        hostname: 'localhost', // Local development images
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'vice.city', // Production domain
        pathname: '**',
      },
    ],
    // Reduced set of device sizes to minimize cache variations
    deviceSizes: [640, 750, 1080, 1920, 2560],
    // Reduced set of image sizes to minimize cache variations
    imageSizes: [16, 64, 128, 256, 384],
    // Increase cache duration to reduce regeneration frequency
    minimumCacheTTL: 86400, // 24 hours (from 1 hour)
    // Only use WebP for better compression and fewer format variations
    formats: ['image/webp'],
    // Increase memory limit for image optimization
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Disable strict mode in production to avoid double-rendering issues
  reactStrictMode: process.env.NODE_ENV === 'development',
  
  // Configure headers for better caching
  async headers() {
    return [
      {
        // Apply cache headers to images
        source: '/(720p|images)/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Configure redirects, headers, etc. if needed
  async rewrites() {
    return [
      {
        source: '/api/crumbless/:path*',
        destination: 'https://www.crumbless.io/api/:path*',
      },
    ];
  },
  
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Configure modularizeImports if needed
  modularizeImports: {
    '@heroicons/react': {
      transform: '@heroicons/react/{{member}}',
    },
  },
  
  // Experimental features
  experimental: {
    // Valid experimental options only
    largePageDataBytes: 4.5 * 1024 * 1024, // Increased to 2MB (from 800KB)
    serverComponentsExternalPackages: ['firebase-admin'],
    outputFileTracingExcludes: {
      '/api/image': [
        '**/node_modules/sharp/**/*'
      ],
    },
  },
}

module.exports = nextConfig 