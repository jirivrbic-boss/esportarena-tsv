import type { Metadata } from "next";
import Link from "next/link";
import { OfficialDocumentsDownloads } from "@/components/official-documents-downloads";

export const metadata: Metadata = {
  title: "Dokumenty ke stažení · ESPORTARENA TSV",
  description:
    "Obecná pravidla CS2, pravidla registrace a souhlas zákonného zástupce — oficiální soubory Word pro turnaj ESPORTARENA TSV.",
};

export default function DokumentyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Dokumenty ke stažení
      </h1>
      <p className="mt-3 text-slate-400">
        Oficiální texty turnaje v jednom místě. Stručný přehled pravidel zůstává
        také na stránce{" "}
        <Link href="/pravidla" className="text-[#39FF14] underline-offset-2 hover:underline">
          Pravidla
        </Link>
        ; zde jsou kompletní soubory pro školy, rodiče a kapitány.
      </p>
      <OfficialDocumentsDownloads variant="all" className="mt-10" />
      <p className="mt-10 text-sm text-slate-500">
        <Link href="/" className="text-[#39FF14] underline-offset-2 hover:underline">
          Zpět na úvod
        </Link>
      </p>
    </main>
  );
}
