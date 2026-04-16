"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { GameId } from "@/lib/games";
import {
  TournamentDetailContent,
  type RegistrationRow,
} from "@/components/tournaments/tournament-detail-content";
import { TournamentJoinPanel } from "@/components/tournaments/tournament-join-panel";
import { useAuth } from "@/contexts/auth-context";
type PublicTournament = {
  name: string;
  gameId: string;
  backgroundImageUrl?: string;
  startsAtMs?: number | null;
  prizePoolText: string;
  rulesText: string;
  faceitUrl: string;
};

export default function DashboardTurnajDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournament, setTournament] = useState<PublicTournament | null>(null);
  const [regs, setRegs] = useState<RegistrationRow[]>([]);

  const load = useCallback(async () => {
    if (!id) {
      setError("Neplatný odkaz.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tournaments/${id}/public`, { cache: "no-store" });
      const j = (await res.json().catch(() => ({}))) as {
        tournament?: PublicTournament;
        registrations?: RegistrationRow[];
        error?: string;
      };
      if (!res.ok || !j.tournament) {
        throw new Error(j.error ?? "Turnaj neexistuje nebo není zveřejněný.");
      }
      setTournament(j.tournament);
      setRegs(j.registrations ?? []);
    } catch {
      setError("Turnaj neexistuje nebo není zveřejněný.");
      setTournament(null);
      setRegs([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Načítání…
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-400">{error ?? "Turnaj není k dispozici."}</p>
      </div>
    );
  }

  const gameId = (tournament.gameId ?? "cs2") as GameId;

  return (
    <TournamentDetailContent
      name={tournament.name}
      gameId={gameId}
      backgroundImageUrl={tournament.backgroundImageUrl}
      startsAtMs={tournament.startsAtMs ?? null}
      prizePoolText={tournament.prizePoolText}
      rulesText={tournament.rulesText}
      faceitUrl={tournament.faceitUrl}
      registrations={regs}
      backHref="/dashboard/turnaje"
      backLabel="← Zpět na turnaje"
      joinSlot={
        user ? (
          <TournamentJoinPanel
            tournamentId={id}
            gameId={gameId}
            faceitUrl={tournament.faceitUrl}
            startsAtMs={tournament.startsAtMs ?? null}
            registeredTeamIds={regs.map((r) => r.teamId)}
            onJoined={() => void load()}
          />
        ) : null
      }
    />
  );
}
