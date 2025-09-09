/** @type {import('next').NextConfig} */
const nextConfig = {
  // These packages should stay external on the server (don't bundle them)
  serverExternalPackages: [
    "playwright",
    "pdf-parse",
  ],
  // Do NOT transpile the same ones; leave this empty or only put client libs here
  transpilePackages: [],
  // Disable ESLint during build to avoid timeout issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;