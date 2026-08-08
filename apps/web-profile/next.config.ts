import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menyilangkan/membungkam error pemicu Turbopack vs Webpack
  turbopack: {},
};

export default nextConfig;