import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/**" },
      { protocol: "https", hostname: "media.discordapp.net", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/profil",
        destination: "/dashboard/profil",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
