import type { MetadataRoute } from "next";
import { publicFotky } from "@/lib/public-assets";
import { SITE_BRAND, SITE_DEFAULT_DESCRIPTION } from "@/lib/site-seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_BRAND} · Studentský turnaj`,
    short_name: "TSV",
    description: SITE_DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    lang: "cs",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: publicFotky("tournament logo.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
