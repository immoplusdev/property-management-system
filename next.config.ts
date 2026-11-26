import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/pms/exports/download/:token",
        destination: "/bff/pms/exports/download/:token",
      },
    ];
  },
};

export default nextConfig;
