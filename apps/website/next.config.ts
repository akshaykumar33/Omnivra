import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    // Editorial photography placeholders until brand photography exists.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default config;
