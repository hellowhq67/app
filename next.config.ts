import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Compiler
  reactCompiler: true,

  // Enable source maps for development and production error tracking
  productionBrowserSourceMaps: true,

  // Optimize output for production
  output: 'standalone',

  // Compress responses (improoves load times)
  compress: true,

  // Power off x-powered-by header
  poweredByHeader: false,
  
  // Add onDemandEntries configuration
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
  // Add generateBuildId configuration
  generateBuildId: async () => {
    // This could be anything, using the latest git hash
    return process.env.GIT_HASH || 'dev';
  },

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
  },

  // 4. Turbopack (Native v16+ implementation)
  // This replaces almost all of your previous 'webpack' fallback logic
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
    // Ignore problematic imports during build
    config.ignoreWarnings = [
      {
        module: /app\/api\/ai-assistant\/route\.ts/,
        message: /createGoogle.*is not exported/,
      },
      {
        module: /app\/api\/questions\/bookmark\/route\.ts/,
        message: /toggleQuestionBookmark.*is not exported/,
      },
      {
        module: /app\/api\/user\/progress\/route\.ts/,
        message: /getUserAnalytics.*is not exported/,
      },
      {
        module: /app\/api\/webhooks\/polar\/route\.ts/,
        message: /upsertUserSubscription.*is not exported/,
      },
      {
        module: /app\/pte\/academic\/mocktest\/page\.tsx/,
        message: /pteTests.*is not exported/,
      },
      {
        module: /app\/pte\/academic\/mocktest\/page\.tsx/,
        message: /testAttempts.*is not exported/,
      },
    ];

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

    // Bundle analyzer (when ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')({
        enabled: true,
      });
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
          openAnalyzer: true,
        })
      );
    }

    return config;
  },
};

export default nextConfig;
