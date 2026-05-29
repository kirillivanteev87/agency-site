import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  /** Меньше пересборок Prisma при HMR */
  serverExternalPackages: ["@prisma/client"],
  /** Реже выгружаем скомпилированные страницы — меньше случайных «падений» при HMR */
  onDemandEntries: {
    maxInactiveAge: 90 * 1000,
    pagesBufferLength: 12,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
