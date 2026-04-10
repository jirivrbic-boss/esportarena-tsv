import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { GlowButton } from "@/components/glow-button";
import { GlassCard } from "@/components/glass-card";

export const metadata: Metadata = {
  title: "Registrace týmu · ESPORTARENA TSV",
  description:
    "Jak probíhá registrace týmu do studentského turnaje CS2 — co mají připravit hráči a co řeší kapitán.",
};

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#39FF14]/40 bg-[#39FF14]/10 font-[family-name:var(--font-bebas)] text-lg text-[#39FF14]"
        aria-hidden
      >
        {n}
      </span>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-400">
          {children}
        </div>
      </div>
    </li>
  );
}

export default function TymRegistracePublicPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Registrace týmu
      </h1>
      <p className="mt-3 text-slate-400">
        Týmový formulář vyplňuje jen <strong className="text-white">kapitán</strong>{" "}
        po přihlášení. Tato stránka je pro celý tým — ať víte dopředu, co budete
        od sebe navzájem potřebovat.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <GlowButton href="/prihlaseni">Přihlásit se jako kapitán</GlowButton>
        <GlowButton href="/registrace" variant="ghost">
          Založit účet kapitána
        </GlowButton>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Po přihlášení otevři v menu kapitána položku stejného jména nebo přejdi na{" "}
        <Link
          href="/dashboard/tym/registrace"
          className="text-[#39FF14] underline-offset-2 hover:underline"
        >
          přímý odkaz na formulář
        </Link>{" "}
        (bez účtu tě aplikace navede na přihlášení).
      </p>

      <GlassCard className="mt-12" delay={0.05}>
        <h2 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white sm:text-3xl">
          Co si připraví hráči a náhradníci
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Do formuláře kapitán zapisuje <strong className="text-white">4 hráče</strong>{" "}
          do základní sestavy a může přidat až{" "}
          <strong className="text-white">2 náhradníky</strong>. U každého člena
          sestavy platí totéž:
        </p>
        <ul className="mt-6 space-y-4 text-sm text-slate-300">
          <li className="flex gap-2">
            <span className="text-[#39FF14]">·</span>
            <span>
              <strong className="text-white">Jméno a příjmení</strong> — tak, jak
              je budeme uvádět u turnaje a v komunikaci s adminy.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#39FF14]">·</span>
            <span>
              <strong className="text-white">Přezdívka na FACEIT</strong> — přesně
              ta, pod kterou hraješ; podle ní se stahuje ELO pro administrátory.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#39FF14]">·</span>
            <span>
              <strong className="text-white">Doklad studentského statusu</strong>{" "}
              (např. fotka ISIC, potvrzení o studiu) — nahraje kapitán jako obrázek
              nebo PDF. Soubor musí být čitelný.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#39FF14]">·</span>
            <span>
              Pokud hráč <strong className="text-white">není plnoletý</strong>,
              je potřeba také{" "}
              <strong className="text-white">souhlas zákonného zástupce</strong>{" "}
              (vyplněná šablona, podpis — typicky sken nebo fotografie). Šablonu
              stáhneš v sekci{" "}
              <Link
                href="/dokumenty#doc-souhlas-zakonneho-zastupce"
                className="text-[#39FF14] underline-offset-2 hover:underline"
              >
                Dokumenty
              </Link>
              .
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#39FF14]">·</span>
            <span>
              <strong className="text-white">Discord</strong> — každý účastník musí
              být na oficiálním serveru turnaje (odkaz a lhůty jsou v pravidlech
              registrace v{" "}
              <Link
                href="/dokumenty"
                className="text-[#39FF14] underline-offset-2 hover:underline"
              >
                Dokumentech
              </Link>
              ).
            </span>
          </li>
        </ul>
        <p className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
          Nahrané citlivé soubory u týmu se{" "}
          <strong className="text-white">automaticky mažou nejpozději po 48 hodinách</strong>{" "}
          — jde čistě o ověření. Podrobnosti:{" "}
          <Link href="/gdpr" className="text-[#39FF14] underline-offset-2 hover:underline">
            GDPR
          </Link>
          .
        </p>
      </GlassCard>

      <GlassCard className="mt-8" delay={0.1}>
        <h2 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white sm:text-3xl">
          Trenér
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          V týmu může být <strong className="text-white">jeden trenér</strong>. V
          formuláři stačí jeho jméno a příjmení (bez herních účtů jako u hráčů).
          Trenér by měl znát pravidla turnaje a být k dispozici týmu v průběhu
          soutěže.
        </p>
      </GlassCard>

      <GlassCard className="mt-8" delay={0.12}>
        <h2 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white sm:text-3xl">
          Postup kapitána (stručně)
        </h2>
        <ol className="mt-8 list-none space-y-8 p-0">
          <Step n={1} title="Účet a profil kapitána">
            <p>
              Založíš účet přes{" "}
              <Link
                href="/registrace"
                className="text-[#39FF14] underline-offset-2 hover:underline"
              >
                registraci kapitána
              </Link>{" "}
              a vyplníš{" "}
              <Link
                href="/dashboard/profil"
                className="text-[#39FF14] underline-offset-2 hover:underline"
              >
                profil
              </Link>
              : kontakty, Discord, herní přezdívky, potvrzení studenta (18+),
              případně vlastní dokumenty. Bez dokončeného profilu nepůjde odeslat
              registrace týmu.
            </p>
          </Step>
          <Step n={2} title="Shromáždění podkladů od spoluhráčů">
            <p>
              Sežeň od každého hráče jméno, FACEIT nick, doklad o studiu a u
              nezletilých souhlas rodiče. Domluvte se na{" "}
              <strong className="text-white">názvu týmu</strong> a na{" "}
              <strong className="text-white">škole / organizaci</strong>, za kterou
              startujete.
            </p>
          </Step>
          <Step n={3} title="Vyplnění a odeslání týmu">
            <p>
              V přihlášeném přehledu otevřeš{" "}
              <strong className="text-white">Registrace týmu</strong>, zadáš údaje
              o sestavě, nahraješ soubory a formulář odešleš. Stav žádosti uvidíš u
              záznamu týmu (např. čeká na schválení).
            </p>
          </Step>
          <Step n={4} title="Po schválení">
            <p>
              Administrátor tým schválí nebo vrátí s připomínkou. Po schválení můžeš
              dostat další instrukce (např. odkaz na FACEIT hub) — sleduj Discord a
              oznámení na webu.
            </p>
          </Step>
        </ol>
      </GlassCard>

      <p className="mt-12 text-center text-sm text-slate-500">
        <Link href="/dokumenty" className="text-[#39FF14] underline-offset-2 hover:underline">
          Formální dokumenty ke stažení
        </Link>
        {" · "}
        <Link href="/pravidla" className="text-[#39FF14] underline-offset-2 hover:underline">
          Pravidla na webu
        </Link>
        {" · "}
        <Link href="/" className="text-slate-400 underline-offset-2 hover:text-white hover:underline">
          Úvod
        </Link>
      </p>
    </main>
  );
}
