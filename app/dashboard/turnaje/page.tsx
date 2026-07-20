"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { GameId } from "@/lib/games";
import { useAuth } from "@/contexts/auth-context";
import {
  TournamentListSections,
  type TournamentListItem,
} from "@/components/tournaments/tournament-list-sections";

export default function DashboardTurnajePage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<TournamentListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/tournaments/public", {
          cache: "no-store",
        });
        const j = (await res.json().catch(() => ({}))) as {
          tournaments?: TournamentListItem[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(j.error ?? `Chyba (${res.status})`);
        }
        setRows(
          (j.tournaments ?? []).map((t) => ({
            ...t,
            gameId: (t.gameId ?? "cs2") as GameId,
          }))
        );
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Chyba načítání");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [user?.uid]);

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
        Aktivní turnaje — přihlas schválený tým. U neaktivních najdeš historii a výsledky.
      </p>

      {loading ? (
        <p className="mt-10 text-slate-500">Načítání…</p>
      ) : err ? (
        <p className="mt-10 text-sm text-red-400" role="alert">
          {err}
        </p>
      ) : (
        <TournamentListSections
          rows={rows}
          hrefPrefix="/dashboard/turnaje"
          emptyMessage="Zatím nejsou žádné zveřejněné turnaje. Až administrátor nějaký přidá, objeví se tady."
        />
      )}

      <p className="mt-10 text-center text-xs text-slate-600">
        <Link href="/dashboard" className="hover:text-slate-400">
          ← Přehled kapitána
        </Link>
      </p>
    </motion.main>
  );
}
