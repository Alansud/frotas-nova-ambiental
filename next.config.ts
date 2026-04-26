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
    remotePatterns: [],
  },
  // Módulos nativos precisam ser tratados como externos no servidor
  serverExternalPackages: [
    "@prisma/client",
    "bcryptjs",
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    "@react-pdf/renderer",
  ],
};

export default nextConfig;
