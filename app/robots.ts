import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-seo";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/edit",
          "/api/",
          "/admin-docasny-pristup",
          "/zakazano",
          "/obnovit-ucet",
          "/heslo/",
          "/zapomenute-heslo",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
