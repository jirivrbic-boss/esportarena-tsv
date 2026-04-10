"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { GameId } from "@/lib/games";
import type { TeamDocument } from "@/lib/types";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

type TeamOption = { id: string; teamName: string; schoolName: string };

type Props = {
  tournamentId: string;
  gameId: GameId;
  /** ID týmů už zapsaných v turnaji */
  registeredTeamIds: string[];
  onJoined: () => void;
};

export function TournamentJoinPanel({
  tournamentId,
  gameId,
  registeredTeamIds,
  onJoined,
}: Props) {
  const { user, profile } = useAuth();
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const regSet = useMemo(
    () => new Set(registeredTeamIds),
    [registeredTeamIds]
  );

  const loadTeams = useCallback(async () => {
    if (!user || !isFirebaseConfigured()) {
      setTeams([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, "teams"),
        where("captainId", "==", user.uid),
        limit(40)
      );
      const snap = await getDocs(q);
      const opts: TeamOption[] = [];
      snap.forEach((d) => {
        const t = d.data() as TeamDocument;
        const gid = t.gameId ?? "cs2";
        if (gid !== gameId) return;
        if (t.status !== "approved") return;
        if (regSet.has(d.id)) return;
        opts.push({
          id: d.id,
          teamName: t.teamName,
          schoolName: t.schoolName,
        });
      });
      setTeams(opts);
      setSelectedId(opts[0]?.id ?? "");
    } finally {
      setLoading(false);
    }
  }, [user, gameId, regSet]);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  async function join() {
    if (!user || !selectedId) return;
    setErr(null);
    setBusy(true);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId: selectedId }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(j.error ?? `Chyba (${res.status})`);
        return;
      }
      onJoined();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Síťová chyba");
    } finally {
      setBusy(false);
    }
  }

  if (!profile?.profileComplete) {
    return (
      <GlassCard>
        <p className="text-sm text-amber-100">
          Pro přihlášení týmu do turnaje{" "}
          <Link href="/dashboard/profil" className="text-[#39FF14] underline">
            dokonči profil kapitána
          </Link>
          .
        </p>
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <GlassCard>
        <p className="text-sm text-slate-500">Načítám tvé týmy…</p>
      </GlassCard>
    );
  }

  if (teams.length === 0) {
    return (
      <GlassCard>
        <h3 className="font-[family-name:var(--font-bebas)] text-xl text-white">
          Připojit se s týmem
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Nemáš žádný <strong className="text-white">schválený</strong> tým v této
          hře, který by ještě nebyl v turnaji přihlášený. Založ tým v{" "}
          <Link href="/dashboard/tymy" className="text-[#39FF14] underline">
            přehledu týmů
          </Link>{" "}
          a počkej na schválení.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <h3 className="font-[family-name:var(--font-bebas)] text-xl text-white">
        Připojit se s týmem
      </h3>
      <p className="mt-2 text-sm text-slate-400">
        Vyber svůj schválený tým ve stejné hře jako turnaj a potvrď přihlášení.
      </p>
      <div className="mt-4">
        <label htmlFor="join-team" className="text-sm text-slate-400">
          Tým
        </label>
        <select
          id="join-team"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.teamName} · {t.schoolName}
            </option>
          ))}
        </select>
      </div>
      {err ? (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {err}
        </p>
      ) : null}
      <GlowButton
        type="button"
        className="mt-4 w-full !justify-center"
        disabled={busy || !selectedId}
        onClick={() => void join()}
      >
        {busy ? "Přihlašuji…" : "Připojit se s týmem"}
      </GlowButton>
    </GlassCard>
  );
}
