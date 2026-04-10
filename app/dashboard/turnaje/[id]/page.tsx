"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { GameId } from "@/lib/games";
import type {
  TournamentDocument,
  TournamentRegistrationDocument,
} from "@/lib/tournaments";
import {
  TournamentDetailContent,
  type RegistrationRow,
} from "@/components/tournaments/tournament-detail-content";
import { TournamentJoinPanel } from "@/components/tournaments/tournament-join-panel";
import { useAuth } from "@/contexts/auth-context";

function fmtTs(t: Timestamp | undefined): string {
  if (!t || typeof t.toDate !== "function") return "—";
  try {
    return t.toDate().toLocaleString("cs-CZ");
  } catch {
    return "—";
  }
}

export default function DashboardTurnajDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournament, setTournament] = useState<TournamentDocument | null>(null);
  const [regs, setRegs] = useState<RegistrationRow[]>([]);

  const load = useCallback(async () => {
    if (!id || !isFirebaseConfigured()) {
      setError(!id ? "Neplatný odkaz." : "Firebase není nakonfigurováno.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const db = getFirebaseDb();
      const tSnap = await getDoc(doc(db, "tournaments", id));
      if (!tSnap.exists()) {
        setError("Turnaj neexistuje nebo není zveřejněný.");
        setTournament(null);
        setRegs([]);
        return;
      }
      const t = tSnap.data() as TournamentDocument;
      if (!t.published) {
        setError("Turnaj neexistuje nebo není zveřejněný.");
        setTournament(null);
        setRegs([]);
        return;
      }
      setTournament(t);

      const rSnap = await getDocs(
        collection(db, "tournaments", id, "registrations")
      );
      const list: RegistrationRow[] = [];
      rSnap.forEach((d) => {
        const x = d.data() as TournamentRegistrationDocument;
        list.push({
          teamId: d.id,
          teamName: x.teamName,
          schoolName: x.schoolName,
          registeredAtLabel: fmtTs(x.registeredAt),
        });
      });
      list.sort((a, b) => a.teamName.localeCompare(b.teamName, "cs"));
      setRegs(list);
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
            registeredTeamIds={regs.map((r) => r.teamId)}
            onJoined={() => void load()}
          />
        ) : null
      }
    />
  );
}
