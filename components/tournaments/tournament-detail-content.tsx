"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { gameLabel, type GameId } from "@/lib/games";
import { OfficialDocumentsDownloads } from "@/components/official-documents-downloads";
import { TournamentBrandTicker } from "@/components/tournaments/tournament-brand-ticker";
import {
  formatFaceitUnlockHint,
  isFaceitHubUnlocked,
} from "@/lib/tournament-faceit";
import type { RosterPlayer } from "@/lib/types";
import { RosterPlayerNick } from "@/components/roster-player-nick";
import { publicFotky } from "@/lib/public-assets";
import { tournamentPhaseLabel, type TournamentPhase } from "@/lib/tournaments";
import { displayPrizePoolText } from "@/lib/prize-pool";

function overviewMeta(gameId: GameId): { teamSize: string; formatHint: string } {
  switch (gameId) {
    case "cs2":
      return {
        teamSize: "5 hráčů (+ náhradníci)",
        formatHint: "MR12 · Faceit hub po schválení",
      };
    case "lol":
      return {
        teamSize: "5 hráčů (+ náhradníci)",
        formatHint: "Summoner's Rift · viz pravidla LoL",
      };
    case "brawl_stars":
      return {
        teamSize: "dle pokynů (např. 3v3)",
        formatHint: "viz pravidla Brawl Stars",
      };
    case "fc26":
      return {
        teamSize: "dle pokynů organizátora",
        formatHint: "viz pravidla FC a Oznámení",
      };
    default:
      return { teamSize: "—", formatHint: "—" };
  }
}

export type RegistrationRow = {
  teamId: string;
  teamName: string;
  schoolName: string;
  registeredAtLabel: string;
};

type Props = {
  name: string;
  gameId: GameId;
  phase?: TournamentPhase;
  backgroundImageUrl?: string;
  startsAtMs?: number | null;
  prizePoolText: string;
  rulesText: string;
  faceitUrl: string;
  viewerHasRegisteredTeam?: boolean;
  registrations: RegistrationRow[];
  joinSlot?: ReactNode;
  sharePath: string;
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

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

function TournamentShareButton({ sharePath }: { sharePath: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function copyLink() {
    const path = sharePath.startsWith("/") ? sharePath : `/${sharePath}`;
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setOpen(false);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Sdílet turnaj"
        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-md border border-white/20 bg-black/40 text-white transition hover:bg-white/10"
      >
        <ShareIcon className="h-4 w-4" />
        <span className="sr-only">Sdílet turnaj</span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 min-w-[12.5rem] overflow-hidden rounded-md border border-white/15 bg-[#0d0d0d] py-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => void copyLink()}
            className="flex w-full px-4 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Kopírovat odkaz
          </button>
        </div>
      ) : null}
      {copied ? (
        <p
          role="status"
          className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#39FF14]/40 bg-black/90 px-3 py-1.5 text-xs font-medium text-[#39FF14]"
        >
          Odkaz zkopírován
        </p>
      ) : null}
    </div>
  );
}

function TeamMemberCard({
  player,
  role,
  idx,
  gameId,
}: {
  player: RosterPlayer;
  role: string;
  idx: number;
  gameId: GameId;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {role} #{idx + 1}
      </p>
      <p className="mt-2 text-sm font-medium text-white">
        {[player.firstName, player.lastName].filter(Boolean).join(" ") || "Jméno neuvedeno"}
      </p>
      <RosterPlayerNick player={player} gameId={gameId} />
    </div>
  );
}

export function TournamentDetailContent({
  name,
  gameId,
  phase = "qualification",
  backgroundImageUrl,
  startsAtMs,
  prizePoolText,
  rulesText,
  faceitUrl,
  viewerHasRegisteredTeam = false,
  registrations,
  joinSlot,
  sharePath,
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
  const defaultBg = publicFotky("foto-arena-cs2.jpeg");
  const bannerBg = backgroundImageUrl?.trim() ? backgroundImageUrl : defaultBg;
  const effectiveFaceitUrl = faceitUrl.trim();
  const faceitUnlocked = isFaceitHubUnlocked(startsAtMs ?? null);
  const { teamSize: overviewTeamSize, formatHint: overviewFormat } = overviewMeta(gameId);
  const startLabel = useMemo(
    () =>
      startsAtMs
        ? new Date(startsAtMs).toLocaleString("cs-CZ")
        : "Bude upřesněno",
    [startsAtMs]
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

      <section className="relative mt-4 w-full overflow-hidden border-y border-white/10 bg-[#0a0a0a]">
        <div
          className="relative min-h-[260px] bg-cover bg-center bg-no-repeat sm:min-h-[360px]"
          style={{ backgroundImage: `url("${bannerBg}")` }}
        >
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/65 to-[#050505]" />
          <div className="relative mx-auto flex min-h-[260px] max-w-6xl flex-col justify-end px-4 pb-8 pt-12 sm:min-h-[360px] sm:px-6 sm:pt-16">
            <p className="text-xs uppercase tracking-[0.25em] text-[#39FF14]">Turnaj</p>
            <h1 className="mt-3 break-words font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-7xl">
              {name}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {gameLabel(gameId)} · {tournamentPhaseLabel(phase)}
            </p>
          </div>
        </div>

        <TournamentBrandTicker gameId={gameId} />

        <div className="relative mx-auto max-w-6xl bg-[#0a0a0a] px-4 pb-6 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 pt-4">
              {viewerHasRegisteredTeam ? (
                <>
                  {effectiveFaceitUrl && faceitUnlocked ? (
                    <a
                      href={effectiveFaceitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-[#39FF14] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black transition hover:brightness-110"
                    >
                      Otevřít turnaj na Faceit
                    </a>
                  ) : null}
                  {!faceitUnlocked ? (
                    <p className="text-xs text-amber-200">
                      {formatFaceitUnlockHint(startsAtMs ?? null)}
                    </p>
                  ) : !effectiveFaceitUrl ? (
                    <p className="text-xs text-amber-200">
                      Faceit odkaz zatím není vyplněný — doplní ho organizátor v adminu
                      turnajů.
                    </p>
                  ) : null}
                </>
              ) : null}
              <button
                type="button"
                onClick={() => setActiveTab("participants")}
                className="rounded-md border border-white/20 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
              >
                Přihlášené týmy ({participantsCount})
              </button>
              <TournamentShareButton sharePath={sharePath} />
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
                    <p className="text-xs uppercase tracking-wide text-slate-500">Soupiska</p>
                    <p className="mt-1">{overviewTeamSize}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Formát / poznámka</p>
                    <p className="mt-1">{overviewFormat}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white">Informace</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                  {displayPrizePoolText(prizePoolText)}
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
                <div className="hidden grid-cols-[minmax(0,1fr)_7.5rem_6.5rem] bg-black/40 px-4 py-2 text-xs uppercase tracking-wide text-slate-500 sm:grid">
                  <p>Tým</p>
                  <p>Stav</p>
                  <p>Akce</p>
                </div>
                <ul>
                  {registrations.map((r) => (
                    <li
                      key={r.teamId}
                      className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 text-sm text-slate-200 sm:grid sm:grid-cols-[minmax(0,1fr)_7.5rem_6.5rem] sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-medium">{r.teamName}</p>
                        <p className="truncate text-xs text-slate-500">{r.schoolName}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:contents">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Přihlášen</p>
                        <button
                          type="button"
                          onClick={() => setSelectedTeam(r)}
                          className="shrink-0 rounded-md border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-[#39FF14]/40 hover:text-[#39FF14]"
                        >
                          Detail
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "rules" ? (
          <section>
            <h2 className="text-xl font-semibold text-white">Pravidla disciplíny</h2>
            <p className="mt-2 text-sm text-slate-400">
              Kompletní rámec pro <strong className="text-white">{gameLabel(gameId)}</strong>{" "}
              (registrace, formát, dokumenty) je na stránce{" "}
              <Link
                href={`/pravidla/${gameId}`}
                className="text-[#39FF14] hover:underline"
              >
                Pravidla — {gameLabel(gameId)}
              </Link>
              . Níže jen doplnění organizátora ke konkrétnímu turnaji.
            </p>
            <div className="mt-4 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-slate-200">
              {rulesText.trim()
                ? rulesText
                : "K tomuto turnaji organizátor zatím nepřidal vlastní text — použij odkaz na pravidla hry výše."}
            </div>
            <OfficialDocumentsDownloads
              gameId={gameId}
              className="mt-6 !rounded-lg !border-white/10 !bg-black/30 !p-4"
              heading={
                gameId === "cs2"
                  ? "PDF k této disciplíně"
                  : "Společná registrace (PDF)"
              }
              intro={
                gameId === "cs2"
                  ? "Obecná pravidla CS2 a společná pravidla registrace — stejné jako na stránce pravidel hry."
                  : "Společná pravidla registrace studentů platí pro celý projekt. Herní formát najdeš na stránce pravidel disciplíny."
              }
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
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-white/10 bg-[#111] p-4 sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 pr-2">
                <h3 className="break-words text-xl font-semibold text-white">{selectedTeam.teamName}</h3>
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
                      <TeamMemberCard player={teamDetail.captainPlayer} role="Kapitán" idx={0} gameId={gameId} />
                    ) : null}
                    {teamDetail.teammates.map((player, idx) => (
                      <TeamMemberCard
                        key={`main-${selectedTeam.teamId}-${idx}`}
                        player={player}
                        role="Hráč"
                        idx={idx}
                        gameId={gameId}
                      />
                    ))}
                    {teamDetail.substitutes.map((player, idx) => (
                      <TeamMemberCard
                        key={`sub-${selectedTeam.teamId}-${idx}`}
                        player={player}
                        role="Náhradník"
                        idx={idx}
                        gameId={gameId}
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
