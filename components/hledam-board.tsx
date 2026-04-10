"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { FreeAgentType } from "@/lib/types";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

type Post = {
  id: string;
  type: FreeAgentType;
  discordUsername: string;
  hoursPlayed: number;
  faceitLevel: number;
  description: string;
};

export function HledamBoard() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterType, setFilterType] = useState<FreeAgentType | "all">("all");
  const [minFaceit, setMinFaceit] = useState(0);
  const [minHours, setMinHours] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [formType, setFormType] = useState<FreeAgentType>("looking_team");
  const [discordUsername, setDiscordUsername] = useState("");
  const [hoursPlayed, setHoursPlayed] = useState(800);
  const [faceitLevel, setFaceitLevel] = useState(5);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    if (!isFirebaseConfigured()) return;
    const db = getFirebaseDb();
    const q = query(
      collection(db, "free_agents"),
      orderBy("createdAt", "desc"),
      limit(80)
    );
    const snap = await getDocs(q);
    const list: Post[] = snap.docs.map((d) => {
      const x = d.data();
      return {
        id: d.id,
        type: x.type as FreeAgentType,
        discordUsername: String(x.discordUsername ?? ""),
        hoursPlayed: Number(x.hoursPlayed ?? 0),
        faceitLevel: Number(x.faceitLevel ?? 0),
        description: String(x.description ?? ""),
      };
    });
    setPosts(list);
    setLoadingPosts(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = posts.filter((p) => {
    if (filterType !== "all" && p.type !== filterType) return false;
    if (p.faceitLevel < minFaceit) return false;
    if (p.hoursPlayed < minHours) return false;
    return true;
  });

  async function onSubmitPost(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormOk(false);
    if (!user) {
      setFormError("Pro vytvoření inzerátu se musíš přihlásit jako kapitán.");
      return;
    }
    if (!discordUsername.trim() || !description.trim()) {
      setFormError("Vyplň Discord a popis.");
      return;
    }
    setSubmitting(true);
    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, "free_agents"), {
        type: formType,
        discordUsername: discordUsername.trim(),
        hoursPlayed,
        faceitLevel,
        description: description.trim().slice(0, 4000),
        createdAt: serverTimestamp(),
      });
      setFormOk(true);
      setDescription("");
      await refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Uložení selhalo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl px-4 py-16 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Hledám tým / hráče
      </h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Veřejná nástěnka pro solo hráče nebo nedostatečné soupisky. Kontaktuj se
        na <span className="text-[#39FF14]">Discordu</span> — ne přes WhatsApp.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1">
          <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
            Filtry
          </h2>
          <div className="mt-4 space-y-3">
            <div>
              <label>Typ</label>
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as FreeAgentType | "all")
                }
                className="mt-1"
              >
                <option value="all">Vše</option>
                <option value="looking_team">Hledám tým</option>
                <option value="looking_player">Hledám hráče</option>
              </select>
            </div>
            <div>
              <label>Min. Faceit level</label>
              <input
                type="number"
                min={0}
                max={10}
                value={minFaceit}
                onChange={(e) => setMinFaceit(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label>Min. hodiny CS2</label>
              <input
                type="number"
                min={0}
                value={minHours}
                onChange={(e) => setMinHours(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <h2 className="mt-10 font-[family-name:var(--font-bebas)] text-2xl text-white">
            Nový inzerát
          </h2>
          {!user && !loading ? (
            <p className="mt-3 text-sm text-amber-200">
              <Link href="/prihlaseni" className="text-[#39FF14] underline">
                Přihlas se
              </Link>{" "}
              jako kapitán (nebo založ účet), abys mohl přidat příspěvek.
            </p>
          ) : null}
          <form onSubmit={onSubmitPost} className="mt-4 space-y-3">
            <div>
              <label>Typ</label>
              <select
                value={formType}
                onChange={(e) =>
                  setFormType(e.target.value as FreeAgentType)
                }
                className="mt-1"
              >
                <option value="looking_team">Hledám tým</option>
                <option value="looking_player">Hledám hráče</option>
              </select>
            </div>
            <div>
              <label>Discord</label>
              <input
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                className="mt-1"
                placeholder="@nebo jmeno#0000"
                required
              />
            </div>
            <div>
              <label>Hodiny v CS2</label>
              <input
                type="number"
                min={0}
                value={hoursPlayed}
                onChange={(e) => setHoursPlayed(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label>Faceit level</label>
              <input
                type="number"
                min={1}
                max={10}
                value={faceitLevel}
                onChange={(e) => setFaceitLevel(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label>Popis</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            {formError ? (
              <p className="text-sm text-red-400">{formError}</p>
            ) : null}
            {formOk ? (
              <p className="text-sm text-[#39FF14]">Příspěvek byl uložen.</p>
            ) : null}
            <GlowButton type="submit" disabled={submitting || !user}>
              {submitting ? "Odesílám…" : "Publikovat"}
            </GlowButton>
          </form>
        </GlassCard>

        <div className="space-y-4 lg:col-span-2">
          {loadingPosts ? (
            <p className="text-slate-500">Načítám příspěvky…</p>
          ) : filtered.length === 0 ? (
            <GlassCard>
              <p className="text-slate-400">Žádné příspěvky neodpovídají filtru.</p>
            </GlassCard>
          ) : (
            filtered.map((p, i) => (
              <GlassCard key={p.id} delay={i * 0.03}>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                      p.type === "looking_team"
                        ? "bg-[#39FF14]/20 text-[#39FF14]"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {p.type === "looking_team"
                      ? "Hledám tým"
                      : "Hledám hráče"}
                  </span>
                  <span className="text-sm text-slate-500">
                    Faceit L{p.faceitLevel} · {p.hoursPlayed} h
                  </span>
                </div>
                <p className="mt-2 font-medium text-[#39FF14]">
                  Discord: {p.discordUsername}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
                  {p.description}
                </p>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </motion.main>
  );
}
