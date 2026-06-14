import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Netlify CDN comprime os assets — compress no servidor gera overhead desnecessário
  compress: process.env.NETLIFY !== 'true',
  poweredByHeader: false,
  // Permite origens de desenvolvimento locais (ignorado em produção)
  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: ["192.168.1.7"],
  }),
  images: {
    formats: ['image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Retrocompatibilidade: veículos cadastrados antes da migração para base64
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // Otimização de imports para bibliotecas pesadas
  experimental: {
    optimizePackageImports: ['recharts'],
  },
  // Módulos nativos precisam ser tratados como externos no servidor
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "bcryptjs",
    "@react-pdf/renderer",
    "sharp",
  ],
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|ico|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/notificacoes',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/alertas',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/veiculos',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=30, stale-while-revalidate=120' },
        ],
      },
    ]
  },
};

export default nextConfig;
