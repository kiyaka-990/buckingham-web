import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [50, 65, 75, 90],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
