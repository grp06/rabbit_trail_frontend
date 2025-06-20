/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  // Suppress hydration warnings in development
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },

  // Experimental flag to handle streaming better
  experimental: {
    // This helps with streaming response issues in development
    serverComponentsExternalPackages: ['openai'],
  },

  // Suppress specific errors in development
  webpack: (config, { dev }) => {
    if (dev) {
      // Ignore specific warnings that are not actionable
      config.ignoreWarnings = [{ module: /node_modules\/next/ }]
    }
    return config
  },
}

export default nextConfig
