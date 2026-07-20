import type { Metadata } from "next";
import { GameRulesHub } from "@/components/game-rules-hub";

export const metadata: Metadata = {
  title: "Pravidla podle her · ESPORTARENA TSV S4",
  description:
    "Studentský turnaj ESPORTARENA TSV Sezóna 4 — pravidla Counter-Strike 2 a League of Legends včetně registrace.",
};

export default function PravidlaHubPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <GameRulesHub />
    </main>
  );
}
