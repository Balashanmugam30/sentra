import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typedRoutes: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    optimizePackageImports: ["zustand"],
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/app",
        permanent: true,
      },
      {
        source: "/app/dashboard",
        destination: "/app",
        permanent: true,
      },
      {
        source: "/landing",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
