import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // PWA requires some tweaks to work with latest Next.js versions
  webpack: (config: any) => {
    return config;
  },
};

export default withPWA(nextConfig);
