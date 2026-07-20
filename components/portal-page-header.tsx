import Link from "next/link";
import type { ReactNode } from "react";

export function PortalPageHeader({
  backHref,
  backLabel = "Přehled",
  title,
  description,
}: {
  backHref: string;
  backLabel?: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <header className="mb-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-[#39FF14]"
      >
        ← {backLabel}
      </Link>
      <h1 className="mt-3 font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>
      ) : null}
    </header>
  );
}
