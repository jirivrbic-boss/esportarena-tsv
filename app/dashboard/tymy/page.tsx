"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { GAMES, type GameId } from "@/lib/games";
import type { TeamStatus } from "@/lib/types";
import { TeamRegistrationForm } from "@/components/team-registration-form";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

type TeamSnap = {
  id: string;
  gameId?: GameId;
  teamName?: string;
  status: TeamStatus;
};

function statusLabel(s: TeamStatus) {
  if (s === "approved") return "Schváleno";
  if (s === "rejected") return "Zamítnuto";
  return "Čeká na schválení";
}

function statusClass(s: TeamStatus) {
  if (s === "approved") return "text-[#39FF14]";
  if (s === "rejected") return "text-red-400";
  return "text-amber-300";
}

export default function DashboardTymyPage() {
  const { user, profile, loading } = useAuth();
  const [teams, setTeams] = useState<TeamSnap[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [expanded, setExpanded] = useState<GameId | null>(null);

  const loadTeams = useCallback(async () => {
    if (!user || !isFirebaseConfigured()) {
      setTeams([]);
      setLoadingTeams(false);
      return;
    }
    const db = getFirebaseDb();
    const q = query(
      collection(db, "teams"),
      where("captainId", "==", user.uid),
      limit(40)
    );
    const snap = await getDocs(q);
    const rows: TeamSnap[] = snap.docs.map((d) => {
      const x = d.data() as TeamSnap;
      return {
        id: d.id,
        gameId: x.gameId,
        teamName: x.teamName,
        status: x.status,
      };
    });
    setTeams(rows);
    setLoadingTeams(false);
  }, [user]);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  function teamForGame(gameId: GameId): TeamSnap | undefined {
    return teams.find((t) => (t.gameId ?? "cs2") === gameId);
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Načítání…
      </div>
    );
  }

  if (!isFirebaseConfigured() || !profile) {
    return (
      <p className="p-10 text-center text-slate-500">
        {!isFirebaseConfigured()
          ? "Nakonfiguruj Firebase."
          : "Načti profil kapitána."}
      </p>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Tvé týmy
      </h1>
      <p className="mt-3 text-sm text-slate-400">
        Každá hra má vlastní registraci. U hry bez týmu uvidíš zámek — založíš ji
        přes stejný proces jako u ostatních. U rozbalené hry můžeš soupisku
        upravit (dokud čeká na schválení).
      </p>

      {!profile.profileComplete ? (
        <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-950/40 p-4 text-sm text-amber-100">
          Nejdřív dokonči{" "}
          <Link href="/dashboard/profil" className="text-[#39FF14] underline">
            profil kapitána
          </Link>
          .
        </p>
      ) : null}

      <div className="mt-10 space-y-4">
        {loadingTeams ? (
          <p className="text-slate-500">Načítám týmy…</p>
        ) : (
          GAMES.map((g) => {
            const t = teamForGame(g.id);
            const locked = !t;
            return (
              <GlassCard key={g.id} delay={0} className="!p-0 overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap">
                  {locked ? (
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-2xl"
                        aria-hidden
                      >
                        🔒
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-[family-name:var(--font-bebas)] text-xl tracking-wide text-white sm:text-2xl">
                          {g.label}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Zatím nemáš vytvořený tým v této hře.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((e) => (e === g.id ? null : g.id))
                      }
                      className="flex min-w-0 flex-1 items-center gap-4 rounded-lg text-left transition-colors hover:bg-white/[0.04]"
                    >
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-2xl"
                        aria-hidden
                      >
                        {expanded === g.id ? "▼" : "▶"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-[family-name:var(--font-bebas)] text-xl tracking-wide text-white sm:text-2xl">
                          {g.label}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          <span className="text-white">
                            {t?.teamName ?? "Bez názvu"}
                          </span>
                          {t ? (
                            <>
                              {" · "}
                              <span className={statusClass(t.status)}>
                                {statusLabel(t.status)}
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </button>
                  )}
                  {locked && profile.profileComplete ? (
                    <GlowButton
                      href={`/dashboard/tym/registrace?hra=${g.id}`}
                      className="!shrink-0 !px-4 !py-2 !text-xs"
                    >
                      Založit tým
                    </GlowButton>
                  ) : null}
                </div>

                <AnimatePresence initial={false}>
                  {!locked && expanded === g.id ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-white/10"
                    >
                      <div className="bg-black/20 p-4 sm:p-6">
                        <TeamRegistrationForm
                          user={user}
                          profile={profile}
                          gameId={g.id}
                          onSaved={() => void loadTeams()}
                        />
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </GlassCard>
            );
          })
        )}
      </div>

      <p className="mt-10 text-center text-xs text-slate-600">
        <Link href="/dashboard" className="hover:text-slate-400">
          ← Přehled kapitána
        </Link>
      </p>
    </motion.main>
  );
}
