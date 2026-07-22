import type { MetadataRoute } from "next";
import { SITE_NAV_SEO, getSiteOrigin } from "@/lib/site-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  const now = new Date();

  const home: MetadataRoute.Sitemap[number] = {
    url: origin,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1,
  };

  const pages: MetadataRoute.Sitemap = SITE_NAV_SEO.map((item) => ({
    url: `${origin}${item.path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: item.path === "/sezona-4" || item.path === "/turnaje" ? 0.9 : 0.75,
  }));

  // Další veřejné stránky mimo hlavní sitelinks seznam
  const extra = ["/prihlaseni", "/gdpr"].map((path) => ({
    url: `${origin}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [home, ...pages, ...extra];
}
