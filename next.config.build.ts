import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React Compiler for build stability
  reactCompiler: false,

  // Enable source maps for development and production error tracking
  productionBrowserSourceMaps: true,

  // Optimize output for production
  output: 'standalone',

  // Compress responses (improves load times)
  compress: true,

  // Power off x-powered-by header
  poweredByHeader: false,
  
  // Allow remote icons/assets used by PTE data
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sgp1.digitaloceanspaces.com",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "www.gravatar.com" },
      { protocol: "https", hostname: "pedagogistspte.com" },
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@tabler/icons-react',
      'lucide-react',
      'recharts',
      'framer-motion'
    ],
  },

  // Custom webpack config for optimizations
  webpack: (config, { isServer, webpack, dev }) => {
    // Fallbacks for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Production optimizations
    if (!dev) {
      // Enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
        minimize: true,
      };
    }

    // Ignore problematic modules for build
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        '@ai-sdk/google': 'commonjs @ai-sdk/google',
      });
    }

    return config;
  },
};

export default nextConfig;
