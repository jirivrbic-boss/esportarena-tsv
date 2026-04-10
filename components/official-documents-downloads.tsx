"use client";

import Link from "next/link";
import {
  documentsForVariant,
  type OfficialDocument,
} from "@/lib/official-documents";

type Props = {
  variant?: "all" | "rules" | "consent";
  className?: string;
  heading?: string;
  intro?: string;
};

function DocRow({ doc }: { doc: OfficialDocument }) {
  const href = `/dokumenty/${doc.file}`;
  return (
    <li
      id={`doc-${doc.id}`}
      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-[#39FF14]/35"
    >
      <a
        href={href}
        download
        className="font-semibold text-[#39FF14] underline-offset-2 hover:underline"
      >
        {doc.title}
      </a>
      <span className="ml-2 text-xs font-normal text-slate-500">(.docx)</span>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {doc.description}
      </p>
    </li>
  );
}

export function OfficialDocumentsDownloads({
  variant = "all",
  className = "",
  heading = "Formální dokumenty ke stažení",
  intro = "Oficiální znění v Microsoft Wordu — vhodné k archivaci, tisku nebo úpravě podle aktuálního znění na webu.",
}: Props) {
  const items = documentsForVariant(variant);
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-black/30 p-6 sm:p-8 ${className}`}
      aria-labelledby="official-docs-heading"
    >
      <h2
        id="official-docs-heading"
        className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white sm:text-3xl"
      >
        {heading}
      </h2>
      {intro ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{intro}</p>
      ) : null}
      <ul className="mt-6 space-y-4">
        {items.map((doc) => (
          <DocRow key={doc.id} doc={doc} />
        ))}
      </ul>
      {variant !== "all" ? (
        <p className="mt-6 text-sm text-slate-500">
          Kompletní přehled:{" "}
          <Link
            href="/dokumenty"
            className="text-[#39FF14] underline-offset-2 hover:underline"
          >
            všechny dokumenty
          </Link>
          .
        </p>
      ) : null}
    </section>
  );
}
