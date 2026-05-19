import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  distDir: 'next-output',
  images: {
    unoptimized: true,
  },
  outputFileTracingExcludes: {
    '/*': [
      'node_modules/sharp/**',
      'node_modules/@img/**',
      'node_modules/next/dist/compiled/next-server/*-experimental.runtime.prod.js',
    ],
  },
}

export default nextConfig
