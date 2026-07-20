import type { Metadata } from "next";
import Link from "next/link";
import { GamesCatalog } from "@/components/games-catalog";
import { TOURNAMENT_SCHOOLS_TYPES } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Hry · ESPORTARENA TSV",
  description:
    "Disciplíny studentského turnaje ESPORTARENA TSV — CS2, League of Legends, Brawl Stars a EA SPORTS FC 26.",
};

export default function HryPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Herní disciplíny
      </h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        V rámci ligy ESPORTARENA TSV soutěží studentské týmy ze škol ({TOURNAMENT_SCHOOLS_TYPES})
        ve čtyřech titulech. Sezóna 4
        je aktivní pro <strong className="text-white">Counter-Strike 2</strong> a{" "}
        <strong className="text-white">League of Legends</strong>; ostatní hry připravujeme
        na další fázi.
      </p>

      <GamesCatalog />

      <p className="mt-12 text-sm text-slate-500">
        Chceš registrovat tým?{" "}
        <Link href="/tym/registrace" className="text-[#39FF14] underline-offset-2 hover:underline">
          Postup registrace
        </Link>
        {" · "}
        <Link href="/turnaje" className="text-[#39FF14] underline-offset-2 hover:underline">
          Přehled turnajů
        </Link>
      </p>
    </main>
  );
}
