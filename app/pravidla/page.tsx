import { RulesBody } from "@/components/rules-body";
import { OfficialDocumentsDownloads } from "@/components/official-documents-downloads";
import type { Metadata } from "next";
import Link from "next/link";
import { getPageContent } from "@/lib/get-cms-page";
import type { PravidlaCms } from "@/lib/cms-defaults";

export const metadata: Metadata = {
  title: "Pravidla · ESPORTARENA TSV S4",
  description:
    "Oficiální pravidla studentského turnaje CS2 — kvalifikace, AFK, disconnect, knife round, BO3.",
};

export default async function PravidlaPage() {
  const cms = (await getPageContent("pravidla")) as PravidlaCms;
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Pravidla turnaje
      </h1>
      <p className="mt-3 text-slate-400">
        Stručný oficiální rámec pro CS2 část ESPORTARENA TSV — Sezóna 4. Detailní
        rozvrh a případné výjimky vždy na{" "}
        <strong className="text-[#39FF14]">Discordu</strong>. Kompletní znění v
        PDF dokumentech najdeš na{" "}
        <Link href="/dokumenty" className="text-[#39FF14] underline-offset-2 hover:underline">
          stránce Dokumenty
        </Link>
        .
      </p>
      <OfficialDocumentsDownloads
        variant="rules"
        className="mt-10"
        heading="Pravidla ke stažení (PDF)"
        intro="Obecná pravidla CS2 a pravidla registrace — stejné znění jako v administraci turnaje."
      />
      <RulesBody sections={cms.sections} />
    </main>
  );
}
