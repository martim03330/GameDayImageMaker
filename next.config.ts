import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The production build lives apart from the dev server's .next, so it can be built while dev runs.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // The dev badge would otherwise end up in exported screenshots.
  devIndicators: false,
  serverExternalPackages: ["better-sqlite3", "playwright"],
  experimental: {
    serverActions: { bodySizeLimit: "300mb" },
  },
};

export default nextConfig;
