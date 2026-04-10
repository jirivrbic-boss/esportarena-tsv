"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { gameLabel, type GameId } from "@/lib/games";
import type { TournamentDocument } from "@/lib/tournaments";
import { GlassCard } from "@/components/glass-card";

type Row = {
  id: string;
  name: string;
  gameId: GameId;
  prizePoolText: string;
};

export default function DashboardTurnajePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setErr("Firebase není nakonfigurováno.");
      setLoading(false);
      return;
    }
    const db = getFirebaseDb();
    const q = query(
      collection(db, "tournaments"),
      where("published", "==", true),
      orderBy("createdAt", "desc")
    );
    void getDocs(q)
      .then((snap) => {
        const list: Row[] = [];
        snap.forEach((d) => {
          const x = d.data() as Partial<TournamentDocument>;
          const gid = (x.gameId ?? "cs2") as GameId;
          list.push({
            id: d.id,
            name: x.name ?? "Bez názvu",
            gameId: gid,
            prizePoolText: x.prizePoolText ?? "",
          });
        });
        setRows(list);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Turnaje
      </h1>
      <p className="mt-3 text-sm text-slate-400">
        Rozklikni turnaj pro detaily, přihlášené týmy a přihlášení svého schváleného
        týmu.
      </p>

      {loading ? (
        <p className="mt-10 text-slate-500">Načítání…</p>
      ) : err ? (
        <p className="mt-10 text-sm text-red-400" role="alert">
          {err}
        </p>
      ) : rows.length === 0 ? (
        <GlassCard className="mt-10">
          <p className="text-slate-400">
            Zatím nejsou žádné zveřejněné turnaje. Až administrátor nějaký přidá,
            objeví se tady.
          </p>
        </GlassCard>
      ) : (
        <ul className="mt-10 space-y-4">
          {rows.map((r, i) => (
            <GlassCard key={r.id} delay={i * 0.04}>
              <Link
                href={`/dashboard/turnaje/${r.id}`}
                className="block transition-colors hover:text-[#39FF14]"
              >
                <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
                  {r.name}
                </h2>
                <p className="mt-1 text-sm text-[#39FF14]">{gameLabel(r.gameId)}</p>
                {r.prizePoolText ? (
                  <p className="mt-2 text-sm text-slate-400">{r.prizePoolText}</p>
                ) : null}
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-600">
                  Otevřít detail →
                </p>
              </Link>
            </GlassCard>
          ))}
        </ul>
      )}

      <p className="mt-10 text-center text-xs text-slate-600">
        <Link href="/dashboard" className="hover:text-slate-400">
          ← Přehled kapitána
        </Link>
      </p>
    </motion.main>
  );
}
