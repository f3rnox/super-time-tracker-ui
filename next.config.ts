import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: "next-output",
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    "/*": ["node_modules/@swc/helpers/**/*"],
  },
  outputFileTracingExcludes: {
    "/*": [
      "node_modules/sharp/**",
      "node_modules/@img/**",
      "node_modules/next/dist/docs/**",
      "node_modules/next/dist/bundle-analyzer/**",
      "node_modules/next/dist/next-devtools/**",
      "node_modules/next/dist/compiled/next-devtools/**",
      "node_modules/next/dist/compiled/react-dom-experimental/**",
      "node_modules/next/dist/compiled/react-dom/**",
      "node_modules/next/dist/compiled/webpack/**",
      "node_modules/next/dist/compiled/babel/**",
      "node_modules/next/dist/compiled/babel-packages/**",
      "node_modules/next/dist/compiled/terser/**",
      "node_modules/next/dist/compiled/@modelcontextprotocol/**",
      "node_modules/next/dist/compiled/*experimental*/**",
      "node_modules/next/dist/compiled/next-server/*-experimental.runtime.prod.js",
    ],
  },
};

export default nextConfig;
