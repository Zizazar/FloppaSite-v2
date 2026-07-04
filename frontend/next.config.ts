import type {NextConfig} from 'next';
import { CONFIG } from './lib/config';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'minotar.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
  return [
    {
      source:'/api/:path*',
      destination: CONFIG.api.baseUrl + '/api/:path*'
    }
  ]},
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {

    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
