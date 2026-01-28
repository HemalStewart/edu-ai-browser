import type { NextConfig } from "next";
import * as path from "path";

const nextConfig: NextConfig = {
  // @ts-ignore - Turbopack root is valid but missing from type definitions
  experimental: {
    turbopack: {
      // Point to the workspace root (2 levels up from apps/renderer)
      root: path.resolve(__dirname, "../../"),
    },
  },
};

export default nextConfig;
