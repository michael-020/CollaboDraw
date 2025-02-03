import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Important for Vercel deployment
  transpilePackages: ['@repo/common', '@repo/backend-common', '@repo/db'],
};

export default nextConfig;
