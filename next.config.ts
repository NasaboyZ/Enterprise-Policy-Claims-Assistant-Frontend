import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const backendUrl = (process.env.API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1", ...Object.values(networkInterfaces()).flatMap(addresses =>
    (addresses ?? []).filter(address => address.family === "IPv4" && !address.internal).map(address => address.address)
  )],
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: { proxyTimeout: 90_000 },
  async rewrites() {
    return ["chat", "upload", "metrics"].map(endpoint => ({
      source: `/api/${endpoint}`,
      destination: `${backendUrl}/api/${endpoint}`,
    }));
  },
};
export default nextConfig;
