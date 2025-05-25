import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 기존 도메인들...
      {
        protocol: 'https',
        hostname: '**', // 모든 HTTPS 도메인 허용
      },
      {
        protocol: 'http',
        hostname: '**', // 모든 HTTP 도메인 허용 (필요시)
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Proxy to FastAPI backend
      },
    ];
  },
};

export default nextConfig;
