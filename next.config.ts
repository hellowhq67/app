import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker builds
  // Set STANDALONE=true when building Docker image
  output: process.env.STANDALONE === 'true' ? 'standalone' : undefined,

  // React 19 Compiler (stable in Next.js 16)
  reactCompiler: true,

  // Performance & Security
  productionBrowserSourceMaps: false, // Disable in production for security
  compress: true,
  poweredByHeader: false,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Build ID for cache busting
  generateBuildId: async () => process.env.GIT_HASH || `build-${Date.now()}`,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "sgp1.digitaloceanspaces.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "www.gravatar.com" },
      { protocol: "https", hostname: "pedagogistspte.com" },
      {
        protocol: "https",
        hostname: "vton1rkowdqbunkl.public.blob.vercel-storage.com",
      },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },

  serverExternalPackages: [
    "@acme/ui",
    "eslint",
    "ts-node",
    "postcss",
    "@huggingface/transformers",
    "typescript",
  ],

  experimental: {
    browserDebugInfoInTerminal: true,
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "@tabler/icons-react",
      "lucide-react",
      "recharts",
      "framer-motion",
    ],

    // Next.js 16 caching improvements
    staleTimes: {
      dynamic: 30, // Cache dynamic pages for 30 seconds
      static: 180, // Cache static pages for 3 minutes
    },
  },

  transpilePackages: [], //keep empty if none
  webpack: (config, { isServer, webpack, dev }) => {
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

    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
        minimize: true,
      };
    }

    if (process.env.ANALYZE === "true") {
      const { BundleAnalyzerPlugin } = require("@next/bundle-analyzer")({
        enabled: true,
      });
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: isServer
            ? "../analyze/server.html"
            : "./analyze/client.html",
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // Security headers (production best practices 2026)
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
