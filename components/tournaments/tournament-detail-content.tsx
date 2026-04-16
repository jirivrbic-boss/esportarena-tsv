"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { gameLabel, type GameId } from "@/lib/games";
import { OfficialDocumentsDownloads } from "@/components/official-documents-downloads";
import { RULES_SECTIONS } from "@/lib/rules-data";
import type { RosterPlayer } from "@/lib/types";

export type RegistrationRow = {
  teamId: string;
  teamName: string;
  schoolName: string;
  registeredAtLabel: string;
};

type Props = {
  name: string;
  gameId: GameId;
  backgroundImageUrl?: string;
  startsAtMs?: number | null;
  prizePoolText: string;
  rulesText: string;
  faceitUrl: string;
  registrations: RegistrationRow[];
  joinSlot?: ReactNode;
  backHref: string;
  backLabel: string;
};

type PublicTeamDetail = {
  id: string;
  teamName: string;
  schoolName: string;
  schoolFullName?: string;
  captainPlayer?: RosterPlayer | null;
  teammates: RosterPlayer[];
  substitutes: RosterPlayer[];
};

function TeamMemberCard({
  player,
  role,
  idx,
}: {
  player: RosterPlayer;
  role: string;
  idx: number;
}) {
  const nick = player.faceitNickname?.trim() ?? "";
  const faceitUrl = nick
    ? `https://www.faceit.com/en/players/${encodeURIComponent(nick)}`
    : null;

  return (
    <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {role} #{idx + 1}
      </p>
      <p className="mt-2 text-sm font-medium text-white">
        {[player.firstName, player.lastName].filter(Boolean).join(" ") || "Jméno neuvedeno"}
      </p>
      {nick ? (
        <a
          href={faceitUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 text-sm text-[#39FF14] hover:underline"
        >
          <span aria-hidden>🎮</span>
          Faceit: {nick}
        </a>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Faceit nick není vyplněný</p>
      )}
    </div>
  );
}

export function TournamentDetailContent({
  name,
  gameId,
  backgroundImageUrl,
  startsAtMs,
  prizePoolText,
  rulesText,
  faceitUrl,
  registrations,
  joinSlot,
  backHref,
  backLabel,
}: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "participants" | "rules">(
    "overview"
  );
  const [selectedTeam, setSelectedTeam] = useState<RegistrationRow | null>(null);
  const [teamDetail, setTeamDetail] = useState<PublicTeamDetail | null>(null);
  const [teamDetailLoading, setTeamDetailLoading] = useState(false);
  const [teamDetailError, setTeamDetailError] = useState<string | null>(null);
  const participantsCount = registrations.length;
  const defaultBg = "/fotky/foto-arena-cs2.jpeg";
  const bannerBg = backgroundImageUrl?.trim() ? backgroundImageUrl : defaultBg;
  const faceitUnlocked = startsAtMs ? Date.now() >= startsAtMs - 24 * 60 * 60 * 1000 : false;
  const startLabel = useMemo(
    () =>
      startsAtMs
        ? new Date(startsAtMs).toLocaleString("cs-CZ")
        : registrations[0]?.registeredAtLabel ?? "Bude upřesněno",
    [registrations, startsAtMs]
  );

  useEffect(() => {
    async function loadTeamDetail(teamId: string) {
      setTeamDetailLoading(true);
      setTeamDetailError(null);
      try {
        const res = await fetch(`/api/teams/${teamId}/public`, { cache: "no-store" });
        const j = (await res.json().catch(() => ({}))) as {
          team?: PublicTeamDetail;
          error?: string;
        };
        if (!res.ok || !j.team) {
          throw new Error(j.error ?? "Tým se nepodařilo načíst.");
        }
        setTeamDetail(j.team);
      } catch (error) {
        setTeamDetail(null);
        setTeamDetailError(
          error instanceof Error ? error.message : "Tým se nepodařilo načíst."
        );
      } finally {
        setTeamDetailLoading(false);
      }
    }

    if (!selectedTeam) {
      setTeamDetail(null);
      setTeamDetailError(null);
      setTeamDetailLoading(false);
      return;
    }

    void loadTeamDetail(selectedTeam.teamId);
  }, [selectedTeam]);

  return (
    <div className="py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs text-slate-500">
          <Link href={backHref} className="text-[#39FF14] hover:underline">
            {backLabel}
          </Link>
        </p>
      </div>

      <section className="relative left-1/2 right-1/2 mt-4 w-screen -translate-x-1/2 overflow-hidden border-y border-white/10 bg-[#0a0a0a]">
        <div
          className="relative min-h-[290px] bg-cover bg-center bg-no-repeat sm:min-h-[360px]"
          style={{ backgroundImage: `url("${bannerBg}")` }}
        >
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/65 to-[#050505]" />
          <div className="relative mx-auto flex min-h-[290px] max-w-6xl flex-col justify-end px-4 pb-8 pt-16 sm:min-h-[360px] sm:px-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[#39FF14]">Turnaj</p>
            <h1 className="mt-3 font-[family-name:var(--font-bebas)] text-5xl tracking-wide text-white sm:text-7xl">
              {name}
            </h1>
            <p className="mt-2 text-sm text-slate-300">{gameLabel(gameId)}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {faceitUrl.trim() && faceitUnlocked ? (
                <a
                  href={faceitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-[#39FF14] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black transition hover:brightness-110"
                >
                  Otevřít turnaj na Faceit
                </a>
              ) : null}
              {!faceitUnlocked ? (
                <p className="text-xs text-amber-200">
                  Link na Faceit turnaj bude dostupný 24 hodin před startem.
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setActiveTab("participants")}
                className="rounded-md border border-white/20 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
              >
                Přihlášené týmy ({participantsCount})
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#070707]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-5 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`text-xs font-semibold uppercase tracking-wide transition ${
                activeTab === "overview"
                  ? "text-[#39FF14]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Přehled
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("participants")}
              className={`text-xs font-semibold uppercase tracking-wide transition ${
                activeTab === "participants"
                  ? "text-[#39FF14]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Týmy ({participantsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              className={`text-xs font-semibold uppercase tracking-wide transition ${
                activeTab === "rules" ? "text-[#39FF14]" : "text-slate-400 hover:text-white"
              }`}
            >
              Pravidla
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        {activeTab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-white">Detaily</h2>
                <div className="mt-4 grid gap-4 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Hra</p>
                    <p className="mt-1">{gameLabel(gameId)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Velikost týmu</p>
                    <p className="mt-1">5v5</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Formát</p>
                    <p className="mt-1">Single Elimination</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white">Informace</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                  {prizePoolText.trim()
                    ? prizePoolText
                    : "Informace o prize poolu a harmonogramu doplní organizátor."}
                </p>
              </section>
            </div>

            <div className="space-y-4">
              <section className="rounded-lg border border-white/10 bg-black/30 p-4">
                <h3 className="text-sm font-semibold text-white">Přehled turnaje</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Region</span>
                    <span>EU / CZ-SK</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Start</span>
                    <span>{startLabel}</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Týmy</span>
                    <span>{participantsCount}</span>
                  </p>
                </div>
              </section>
              {joinSlot ? <div>{joinSlot}</div> : null}
            </div>
          </div>
        ) : null}

        {activeTab === "participants" ? (
          <section>
            <h2 className="text-xl font-semibold text-white">Přihlášené týmy ({participantsCount})</h2>
            {registrations.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Zatím žádný přihlášený tým.</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
                <div className="grid grid-cols-[minmax(0,1fr)_130px_110px] bg-black/40 px-4 py-2 text-xs uppercase tracking-wide text-slate-500">
                  <p>Tým</p>
                  <p>Stav</p>
                  <p>Akce</p>
                </div>
                <ul>
                  {registrations.map((r) => (
                    <li
                      key={r.teamId}
                      className="grid grid-cols-[minmax(0,1fr)_130px_110px] items-center gap-3 border-t border-white/10 px-4 py-3 text-sm text-slate-200"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{r.teamName}</p>
                        <p className="truncate text-xs text-slate-500">{r.schoolName}</p>
                      </div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Přihlášen</p>
                      <button
                        type="button"
                        onClick={() => setSelectedTeam(r)}
                        className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-[#39FF14]/40 hover:text-[#39FF14]"
                      >
                        Detail
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "rules" ? (
          <section>
            <h2 className="text-xl font-semibold text-white">Pravidla</h2>
            <p className="mt-2 text-sm text-slate-400">
              Hlavní pravidla turnaje a oficiální dokumenty jsou stejné jako na stránce{" "}
              <Link href="/pravidla" className="text-[#39FF14] hover:underline">
                Pravidla
              </Link>
              .
            </p>
            <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-black/30 p-4">
              {RULES_SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className="font-semibold text-white">{section.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">{section.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-slate-200">
              {rulesText.trim() ? rulesText : "Pravidla doplní organizátor."}
            </div>
            <OfficialDocumentsDownloads
              variant="rules"
              className="mt-6 !rounded-lg !border-white/10 !bg-black/30 !p-4"
              heading="Oficiální dokumenty k turnaji"
              intro="Tyto PDF dokumenty jsou dostupné i na stránce Dokumenty."
            />
          </section>
        ) : null}
      </div>

      {selectedTeam ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelectedTeam(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-white/10 bg-[#111] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedTeam.teamName}</h3>
                <p className="mt-1 text-xs text-slate-500">{selectedTeam.schoolName}</p>
                {teamDetail?.schoolFullName ? (
                  <p className="mt-1 text-xs text-slate-600">{teamDetail.schoolFullName}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {teamDetailLoading ? (
              <p className="mt-4 text-sm text-slate-400">Načítám sestavu týmu…</p>
            ) : null}

            {teamDetailError ? (
              <p className="mt-4 text-sm text-red-400">{teamDetailError}</p>
            ) : null}

            {teamDetail ? (
              <>
                <div className="mt-6">
                  <h4 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
                    Sestava týmu
                  </h4>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {teamDetail.captainPlayer ? (
                      <TeamMemberCard player={teamDetail.captainPlayer} role="Kapitán" idx={0} />
                    ) : null}
                    {teamDetail.teammates.map((player, idx) => (
                      <TeamMemberCard
                        key={`main-${selectedTeam.teamId}-${idx}`}
                        player={player}
                        role="Hráč"
                        idx={idx}
                      />
                    ))}
                    {teamDetail.substitutes.map((player, idx) => (
                      <TeamMemberCard
                        key={`sub-${selectedTeam.teamId}-${idx}`}
                        player={player}
                        role="Náhradník"
                        idx={idx}
                      />
                    ))}
                  </div>
                </div>

                {!teamDetail.captainPlayer &&
                teamDetail.teammates.length === 0 &&
                teamDetail.substitutes.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">Tým zatím nemá vyplněnou soupisku.</p>
                ) : null}
              </>
            ) : null}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="rounded-md border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
