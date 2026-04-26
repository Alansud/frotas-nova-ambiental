import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Permite origens de desenvolvimento locais (ignorado em produção)
  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: ["192.168.1.7"],
  }),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Módulos nativos precisam ser tratados como externos no servidor
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "bcryptjs",
    "@react-pdf/renderer",
  ],
};

export default nextConfig;
