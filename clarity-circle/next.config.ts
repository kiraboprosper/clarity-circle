import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Use Next.js default output (dynamic/runtime-enabled). App Hosting
  // framework adapter will optimize the build for hosting.
  turbopack: {
    // Use an absolute path for turbopack.root to avoid warnings on Vercel
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.printify.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
