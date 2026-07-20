import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Volitelné: lokální dev režim pro OpenNext + Cloudflare (Wrangler).
 * Zapni explicitně jen když to potřebuješ:
 *   CLOUDFLARE_LOCAL_DEV=true npm run dev
 */
if (process.env.CLOUDFLARE_LOCAL_DEV === "true") {
  void import("@opennextjs/cloudflare")
    .then((m) => m.initOpenNextCloudflareForDev())
    .catch((e) => {
      console.warn("[opennext/cloudflare] init failed:", e);
    });
}

const nextConfig: NextConfig = {
  // Cloudflare Worker runtime zakazuje dynamické vyhodnocování kódu (eval/new Function),
  // které React Compiler v našem stacku vyžaduje.
  reactCompiler: false,
  serverExternalPackages: ["firebase-admin"],
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "firebase/app",
      "firebase/auth",
    ],
  },
  turbopack: {
    root: projectRoot,
  },
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
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Content-Security-Policy",
        value:
          "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://player.twitch.tv https://www.youtube.com https://www.youtube-nocookie.com; frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://player.twitch.tv https://www.twitch.tv https://www.youtube.com https://www.youtube-nocookie.com; connect-src 'self' https: wss:;",
      },
    ];
    const headers =
      process.env.NODE_ENV === "production"
        ? [
            ...securityHeaders,
            {
              key: "Strict-Transport-Security",
              value: "max-age=31536000; includeSubDomains",
            },
          ]
        : securityHeaders;

    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },
};

export default nextConfig;
