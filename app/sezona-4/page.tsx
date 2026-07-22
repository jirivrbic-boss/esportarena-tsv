import type { Metadata } from "next";
import { SeasonPageClient } from "@/components/season/season-page-client";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = pageMetadata({
  title: "Sezóna 4",
  description:
    "Harmonogram Sezóny 4, zápis do sezóny, kvalifikace a pavouk pro CS2 a LoL.",
  path: "/sezona-4",
});

export default function Sezona4Page() {
  return <SeasonPageClient seasonSlug="sezona-4" />;
}
