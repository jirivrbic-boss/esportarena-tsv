import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ochrana údajů (GDPR) · ESPORTARENA TSV",
  description:
    "Zpracování citlivých dokumentů při ověření studentského statusu a automatické mazání po 48 hodinách.",
};

export default function GdprPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Ochrana údajů <span className="text-[#39FF14]">(GDPR)</span>
      </h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-300">
        <p>
          Při registraci týmu nahráváš dokumenty sloužící výhradně k ověření, že
          hráči splňují podmínku studentského statusu (např. ISIC, potvrzení o studiu)
          a v případě nezletilých též souhlas zákonného zástupce.
        </p>
        <p>
          Tyto citlivé soubory jsou uloženy zabezpečeně ve Firebase Storage a{" "}
          <strong className="text-white">
            jsou automaticky smazány nejpozději po 48 hodinách
          </strong>{" "}
          od nahrání — technicky je maže naplánovaný úklid na serveru (cron), aby
          nezůstávaly déle, než je nutné pro kontrolu administrace.
        </p>
        <p>
          Údaje nepoužíváme k marketingu ani je nepředáváme třetím stranám mimo
          technického zpracovatele hostingu a služeb nutných pro chod turnaje
          (např. ověření účtu, notifikace).
        </p>
        <p>
          <Link href="/" className="text-[#39FF14] underline-offset-4 hover:underline">
            Zpět na úvod
          </Link>
        </p>
      </div>
    </main>
  );
}
