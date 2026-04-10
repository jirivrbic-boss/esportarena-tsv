import type { ReactNode } from "react";
import Link from "next/link";
import { gameLabel, type GameId } from "@/lib/games";

export type RegistrationRow = {
  teamId: string;
  teamName: string;
  schoolName: string;
  registeredAtLabel: string;
};

type Props = {
  name: string;
  gameId: GameId;
  prizePoolText: string;
  rulesText: string;
  faceitUrl: string;
  registrations: RegistrationRow[];
  /** Volitelné: panel přihlášení týmu (jen kapitánský portál). */
  joinSlot?: ReactNode;
  /** Odkaz zpět (různý pro veřejnou / dashboard cestu). */
  backHref: string;
  backLabel: string;
};

export function TournamentDetailContent({
  name,
  gameId,
  prizePoolText,
  rulesText,
  faceitUrl,
  registrations,
  joinSlot,
  backHref,
  backLabel,
}: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs text-slate-500">
        <Link href={backHref} className="text-[#39FF14] hover:underline">
          {backLabel}
        </Link>
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        {name}
      </h1>
      <p className="mt-2 text-lg font-medium text-[#39FF14]">{gameLabel(gameId)}</p>

      <section className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Prize pool
        </h2>
        <p className="mt-2 font-[family-name:var(--font-bebas)] text-3xl text-[#39FF14] drop-shadow-[0_0_16px_rgba(57,255,20,0.2)]">
          {prizePoolText.trim() ? prizePoolText : "—"}
        </p>
      </section>

      {faceitUrl.trim() ? (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Faceit
          </h2>
          <a
            href={faceitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-[#39FF14] underline-offset-2 hover:underline"
          >
            Otevřít turnaj na Faceit →
          </a>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Pravidla
        </h2>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
          {rulesText.trim() ? rulesText : "Pravidla doplní organizátor."}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
          Přihlášené týmy ({registrations.length})
        </h2>
        {registrations.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Zatím žádný přihlášený tým.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {registrations.map((r) => (
              <li
                key={r.teamId}
                className="rounded-lg border border-white/10 bg-black/30 px-4 py-3"
              >
                <p className="font-medium text-white">{r.teamName}</p>
                <p className="text-sm text-slate-400">{r.schoolName}</p>
                <p className="mt-1 text-xs text-slate-600">{r.registeredAtLabel}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {joinSlot ? <div className="mt-10">{joinSlot}</div> : null}
    </div>
  );
}
