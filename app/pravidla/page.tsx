import type { Metadata } from "next";
import { GameRulesHub } from "@/components/game-rules-hub";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = pageMetadata({
  title: "Pravidla",
  description:
    "Oficiální pravidla turnaje podle her — formát, soupiska a podmínky účasti.",
  path: "/pravidla",
});

export default function PravidlaHubPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <GameRulesHub />
    </main>
  );
}
