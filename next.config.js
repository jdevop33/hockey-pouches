/** @type {import('next').NextConfig} */

const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
        enabled: true,
      })
    : config => config;

const nextConfig = {
  reactStrictMode: true,
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Don't use static export since we have dynamic API routes
  // Completely disable static generation and prerendering
  output: 'standalone',
  // Increase timeout for static page generation
  staticPageGenerationTimeout: 120,

  // Skip type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
      {
        protocol: 'https',
        hostname: 'poucheswholesale.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hockeypouches.ca',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nicotinetins.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
  // Ensure the basePath is set correctly
  basePath: '',
  // Ensure the output directory is set correctly
  distDir: '.next',
  // Add compression for production builds
  compress: true,
  // Optimize for production
  poweredByHeader: false,
  // Generate ETags for improved caching
  generateEtags: true,
  // Optimize bundle size
  // Configure compiler options
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn', 'info'],
          }
        : false,
  },
  // Configure headers for better security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Enable experimental features for Next.js
  experimental: {
    // Enable server actions (as an object with properties)
    serverActions: {
      allowedOrigins: ['localhost:3000', 'nicotinetins.com'],
    },
  },
};

module.exports = withBundleAnalyzer(nextConfig);
