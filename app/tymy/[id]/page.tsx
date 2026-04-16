"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { gameLabel, type GameId } from "@/lib/games";
import type { RosterPlayer } from "@/lib/types";

type PublicTeam = {
  id: string;
  teamName: string;
  schoolName: string;
  schoolFullName?: string;
  gameId: string;
  captainPlayer?: RosterPlayer | null;
  teammates: RosterPlayer[];
  substitutes: RosterPlayer[];
};

function PlayerRow({
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
    <li className="rounded-lg border border-white/10 bg-black/30 px-4 py-3">
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
    </li>
  );
}

export default function PublicTeamDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<PublicTeam | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Neplatný odkaz.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/teams/${id}/public`, { cache: "no-store" });
        const j = (await res.json().catch(() => ({}))) as {
          team?: PublicTeam;
          error?: string;
        };
        if (!res.ok || !j.team) {
          throw new Error(j.error ?? "Tým neexistuje.");
        }
        setTeam(j.team);
      } catch {
        setError("Tým se nepodařilo načíst.");
        setTeam(null);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Načítání…
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-400">{error ?? "Tým není k dispozici."}</p>
      </div>
    );
  }

  const gameId = (team.gameId ?? "cs2") as GameId;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-xs text-slate-500">
        <Link href="/turnaje" className="text-[#39FF14] hover:underline">
          ← Zpět na turnaje
        </Link>
      </p>

      <section className="mt-4 rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-6">
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
          {team.teamName}
        </h1>
        <p className="mt-2 text-sm text-slate-300">{team.schoolName}</p>
        {team.schoolFullName ? (
          <p className="mt-1 text-sm text-slate-500">{team.schoolFullName}</p>
        ) : null}
        <p className="mt-1 text-sm font-medium text-[#39FF14]">{gameLabel(gameId)}</p>
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
          Sestava
        </h2>
        {team.teammates.length === 0 && team.substitutes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Tým zatím nemá vyplněnou soupisku.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {team.captainPlayer ? (
              <PlayerRow player={team.captainPlayer} role="Kapitán" idx={0} />
            ) : null}
            {team.teammates.map((player, idx) => (
              <PlayerRow key={`main-${idx}`} player={player} role="Hráč" idx={idx} />
            ))}
            {team.substitutes.map((player, idx) => (
              <PlayerRow
                key={`sub-${idx}`}
                player={player}
                role="Náhradník"
                idx={idx}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
