/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Disable ESLint during build (for Docker)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during build (for Docker)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure webpack for Spline and other libraries
  webpack: (config, { isServer }) => {
    // Handle canvas module
    if (isServer) {
      config.externals = [...config.externals, 'canvas'];
    }
    
    return config;
  },
};

export default nextConfig;
