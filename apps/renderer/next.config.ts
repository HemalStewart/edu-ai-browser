import type { NextConfig } from "next";
import * as path from "path";

const nextConfig: NextConfig = {
  // The dev badge sits bottom-left, on top of the Quantum rail's pinned Settings item.
  devIndicators: false,
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
};

export default nextConfig;
