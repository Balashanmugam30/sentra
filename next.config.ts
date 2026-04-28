import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ["zustand"],
  },
};

export default nextConfig;
