import { SeasonPageClient } from "@/components/season/season-page-client";

export const metadata = {
  title: "Sezóna 4 · ESPORTARENA TSV",
  description:
    "Školní turnaj Sezóna 4 — registrace, kvalifikace CS2 a League of Legends, pavouk a LAN finále.",
};

export default function Sezona4Page() {
  return <SeasonPageClient seasonSlug="sezona-4" />;
}
