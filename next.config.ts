import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      // Foto-Uploads per Server Action: Standard-Limit ist 1 MB.
      // bewusste Obergrenze statt kein Limit (DDoS-Schutz, siehe next.config-Doku)
      bodySizeLimit: '12mb',
    },
  },
};

export default nextConfig;
