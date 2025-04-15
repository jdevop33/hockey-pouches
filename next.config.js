/** @type {import('next').NextConfig} */

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({
      enabled: true,
    })
  : (config) => config;

const nextConfig = {
  reactStrictMode: true,
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
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
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      }
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
};

module.exports = withBundleAnalyzer(nextConfig);
