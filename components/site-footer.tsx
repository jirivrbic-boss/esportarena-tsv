import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#050505] py-12 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="font-[family-name:var(--font-bebas)] text-2xl tracking-[0.14em] text-white">
            ESPORTARENA TSV
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed">
            Oficiální studentský turnaj v CS2. Propojení s IT vzděláváním —
            sítě, správa, multimédia.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Komunikace</p>
          <p className="max-w-xs leading-relaxed text-[#39FF14]">
            Veškerá oficiální komunikace probíhá výhradně na{" "}
            <strong className="text-white">Discordu</strong>. WhatsApp ani jiné
            kanály nejsou používány.
          </p>
          <Link
            href="/pravidla"
            className="inline-block text-slate-300 underline-offset-4 hover:text-white hover:underline"
          >
            Pravidla turnaje
          </Link>
          <Link
            href="/gdpr"
            className="mt-2 inline-block text-slate-300 underline-offset-4 hover:text-white hover:underline"
          >
            Ochrana údajů (GDPR)
          </Link>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} EsportArena Plzeň · Sezóna 4
      </p>
    </footer>
  );
}
