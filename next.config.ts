import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (smallest at the same visual quality), WebP as fallback.
    formats: ["image/avif", "image/webp"],
    // Allowed quality levels for next/image. 90 is used for hero and full-bleed
    // photos so they stay crisp on large and retina screens.
    qualities: [75, 85, 90],
    // Include large widths so full-bleed photos are not upscaled on 2K/4K screens.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2560, 3840],
    imageSizes: [32, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Add hosts here if editors paste image URLs from elsewhere (e.g. a CDN).
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
