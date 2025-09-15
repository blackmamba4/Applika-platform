/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint and TypeScript during builds for faster development
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize for development
  experimental: {
    // Enable faster refresh
    optimizePackageImports: ['lucide-react'],
  },
  
  // Webpack configuration for better development experience (only when not using Turbopack)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer && !process.env.TURBOPACK) {
      // Optimize for faster hot reloading
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
  
  // External packages that should not be bundled
  serverExternalPackages: ['playwright'],
  
  // Enable source maps in development
  // productionSourceMaps: false, // This option is not valid in Next.js 15
  
  // Optimize images
  images: {
    domains: [],
  },
};

module.exports = nextConfig;