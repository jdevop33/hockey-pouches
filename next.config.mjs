/** @type {import('next').NextConfig} */

// Use ESM import for bundle analyzer
import bundleAnalyzer from '@next/bundle-analyzer';
import { execSync } from 'child_process';

const withBundleAnalyzer =
  process.env.ANALYZE === 'true' ? bundleAnalyzer({ enabled: true }) : config => config;

// Run prepare script before build
if (process.env.NODE_ENV === 'production') {
  try {
    console.log('Running prepare-vercel-build script before production build...');
    execSync('node scripts/prepare-vercel-build.mjs', { stdio: 'inherit' });
  } catch (error) {
    console.error('Warning: prepare-vercel-build script failed, continuing with build', error);
  }
}

const nextConfig = {
  reactStrictMode: true,
  // Enable ESLint during build
  eslint: {
    // Only ignore ESLint during emergency builds
    ignoreDuringBuilds: process.env.EMERGENCY_BUILD === 'true',
  },
  // Enable TypeScript error checking during production builds
  typescript: {
    // Only ignore TypeScript errors during emergency builds
    ignoreBuildErrors: process.env.EMERGENCY_BUILD === 'true',
  },
  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    unoptimized: process.env.NODE_ENV !== 'production', // Only optimize in production
    // Enable image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: [
      'localhost',
      'hockey-pouches.vercel.app',
      'hockeypouch.com',
      'www.hockeypouch.com',
      'nicotinetins.com',
      'poucheswholesale.com',
      'hockeypouches.ca',
      'i.ytimg.com',
      'img.youtube.com',
      'randomuser.me'
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
  // Enable experimental features for Next.js 15
  experimental: {
    // Enable server actions (as an object with properties)
    serverActions: {
      allowedOrigins: ['localhost:3000', 'nicotinetins.com'],
    },
  },
  // Fix the module typeless warning
  webpack: config => {
    // Resolve ESM/CJS conflicts
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };

    return config;
  },
};

// Use ESM exports
export default withBundleAnalyzer(nextConfig);
