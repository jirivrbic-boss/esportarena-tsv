"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import type { GameId } from "@/lib/games";
import { GlassCard } from "@/components/glass-card";
import { TournamentJoinPanel } from "@/components/tournaments/tournament-join-panel";

type Props = {
  tournamentId: string;
  gameId: GameId;
  faceitUrl: string;
  startsAtMs: number | null;
  registeredTeamIds: string[];
  onJoined: () => void;
};

export function PublicTournamentJoinSlot({
  tournamentId,
  gameId,
  faceitUrl,
  startsAtMs,
  registeredTeamIds,
  onJoined,
}: Props) {
  const { user } = useAuth();

  if (!user) {
    return (
      <GlassCard>
        <h3 className="font-[family-name:var(--font-bebas)] text-xl text-white">
          Připojit se s týmem
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Přihlášení do turnaje může provést jen kapitán se schváleným týmem ve stejné
          hře.
        </p>
        <Link href="/prihlaseni" className="mt-4 inline-block text-[#39FF14] underline">
          Přihlásit se jako kapitán →
        </Link>
      </GlassCard>
    );
  }

  return (
    <TournamentJoinPanel
      tournamentId={tournamentId}
      gameId={gameId}
      faceitUrl={faceitUrl}
      startsAtMs={startsAtMs}
      registeredTeamIds={registeredTeamIds}
      onJoined={onJoined}
    />
  );
}
