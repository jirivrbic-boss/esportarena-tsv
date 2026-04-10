"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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

type Flow = "home" | "post" | "search";

function typeLabel(t: FreeAgentType) {
  return t === "looking_team" ? "Hledám tým" : "Hledám hráče do týmu";
}

export function HledamBoard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [flow, setFlow] = useState<Flow>("home");
  const [postStep, setPostStep] = useState(0);
  const [searchStep, setSearchStep] = useState(0);
  const [searchAnimating, setSearchAnimating] = useState(false);

  const [formType, setFormType] = useState<FreeAgentType>("looking_team");
  const [discordUsername, setDiscordUsername] = useState("");
  const [hoursPlayed, setHoursPlayed] = useState(800);
  const [faceitLevel, setFaceitLevel] = useState(5);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchWant, setSearchWant] = useState<FreeAgentType | null>(null);
  const [minFaceit, setMinFaceit] = useState(0);
  const [minHours, setMinHours] = useState(0);

  const refresh = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const searchResults =
    searchWant == null
      ? []
      : posts.filter((p) => {
          if (p.type !== searchWant) return false;
          if (minFaceit > 0 && p.faceitLevel < minFaceit) return false;
          if (minHours > 0 && p.hoursPlayed < minHours) return false;
          return true;
        });

  function resetPostFlow() {
    setPostStep(0);
    setFormType("looking_team");
    setDiscordUsername("");
    setHoursPlayed(800);
    setFaceitLevel(5);
    setDescription("");
    setFormError(null);
    setPostSuccess(false);
  }

  function resetSearchFlow() {
    setSearchStep(0);
    setSearchWant(null);
    setMinFaceit(1);
    setMinHours(0);
    setSearchAnimating(false);
  }

  async function onSubmitPost() {
    setFormError(null);
    if (!discordUsername.trim() || !description.trim()) {
      setFormError("Vyplň Discord a popis.");
      return;
    }
    if (!isFirebaseConfigured()) {
      setFormError("Firebase není nakonfigurováno.");
      return;
    }
    setSubmitting(true);
    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, "free_agents"), {
        type: formType,
        discordUsername: discordUsername.trim().slice(0, 120),
        hoursPlayed,
        faceitLevel,
        description: description.trim().slice(0, 4000),
        createdAt: serverTimestamp(),
      });
      setPostSuccess(true);
      await refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Uložení selhalo.");
    } finally {
      setSubmitting(false);
    }
  }

  function runSearchAnimation() {
    if (searchWant == null) return;
    setSearchAnimating(true);
    window.setTimeout(() => {
      setSearchAnimating(false);
      setSearchStep(2);
    }, 1600);
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl px-4 py-16 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Hledám tým / hráče
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Kontakt výhradně na{" "}
        <span className="text-[#39FF14]">Discordu</span> — ne přes WhatsApp.
        Inzeráty se po 60 dnech automaticky maží (serverový úklid).
      </p>

      {!isFirebaseConfigured() ? (
        <GlassCard className="mt-8">
          <p className="text-amber-200">
            Firebase není nakonfigurováno — nástěnka nejde načíst.
          </p>
        </GlassCard>
      ) : null}

      <AnimatePresence mode="wait">
        {flow === "home" ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="mt-10 space-y-4"
          >
            <GlassCard>
              <p className="text-sm text-slate-400">Co chceš udělat?</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <GlowButton
                  type="button"
                  className="flex-1"
                  onClick={() => {
                    resetPostFlow();
                    setFlow("post");
                  }}
                >
                  Přidat inzerát
                </GlowButton>
                <GlowButton
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    resetSearchFlow();
                    setFlow("search");
                  }}
                >
                  Hledám tým / hráče
                </GlowButton>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Inzerát přidá kdokoli — účet nepotřebuješ.
              </p>
            </GlassCard>
            <p className="text-center text-xs text-slate-600">
              <Link href="/" className="hover:text-slate-400">
                ← Zpět na úvod
              </Link>
            </p>
          </motion.div>
        ) : null}

        {flow === "post" ? (
          <motion.div
            key="post"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="mt-10"
          >
            <GlassCard>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
                  Přidat inzerát
                </h2>
                <span className="text-xs text-slate-500">
                  {postSuccess ? "Hotovo" : `Krok ${postStep + 1} / 4`}
                </span>
              </div>

              {postSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 space-y-4"
                >
                  <p className="text-lg font-medium text-[#39FF14]">
                    Inzerát byl úspěšně přidán.
                  </p>
                  <p className="text-sm text-slate-300">
                    Automaticky se smaže nejpozději po 60 dnech. Kontaktuj
                    zájemce na Discordu.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <GlowButton
                      type="button"
                      onClick={() => {
                        resetPostFlow();
                        setFlow("home");
                      }}
                    >
                      Zpět na výběr
                    </GlowButton>
                    <GlowButton
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        resetPostFlow();
                      }}
                    >
                      Přidat další
                    </GlowButton>
                  </div>
                </motion.div>
              ) : (
                <>
                  {postStep === 0 ? (
                    <div className="mt-6 space-y-4">
                      <p className="text-sm text-slate-300">
                        Co přesně nabízíš / hledáš?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormType("looking_player");
                          setPostStep(1);
                        }}
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-4 text-left text-sm text-white transition-colors hover:border-[#39FF14]/50 hover:bg-white/10"
                      >
                        <span className="font-semibold text-[#39FF14]">
                          Hledám hráče do týmu
                        </span>
                        <span className="mt-1 block text-slate-400">
                          Máme soupisku a potřebujeme doplnit hráče.
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormType("looking_team");
                          setPostStep(1);
                        }}
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-4 text-left text-sm text-white transition-colors hover:border-[#39FF14]/50 hover:bg-white/10"
                      >
                        <span className="font-semibold text-[#39FF14]">
                          Hledám tým
                        </span>
                        <span className="mt-1 block text-slate-400">
                          Jsem solo / bez týmu a chci hrát turnaj.
                        </span>
                      </button>
                    </div>
                  ) : null}

                  {postStep === 1 ? (
                    <div className="mt-6 space-y-4">
                      <label className="text-sm text-slate-400">
                        Tvůj Discord nick
                      </label>
                      <input
                        value={discordUsername}
                        onChange={(e) => setDiscordUsername(e.target.value)}
                        className="w-full"
                        placeholder="např. jmeno nebo @nick"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <GlowButton
                          type="button"
                          variant="ghost"
                          onClick={() => setPostStep(0)}
                        >
                          Zpět
                        </GlowButton>
                        <GlowButton
                          type="button"
                          disabled={!discordUsername.trim()}
                          onClick={() => setPostStep(2)}
                        >
                          Pokračovat
                        </GlowButton>
                      </div>
                    </div>
                  ) : null}

                  {postStep === 2 ? (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label>Hodiny v CS2 (orientačně)</label>
                        <input
                          type="number"
                          min={0}
                          max={50000}
                          value={hoursPlayed}
                          onChange={(e) =>
                            setHoursPlayed(Number(e.target.value))
                          }
                          className="mt-1 w-full"
                        />
                      </div>
                      <div>
                        <label>Faceit level (1–10)</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={faceitLevel}
                          onChange={(e) =>
                            setFaceitLevel(Number(e.target.value))
                          }
                          className="mt-1 w-full"
                        />
                      </div>
                      <div className="flex gap-2">
                        <GlowButton
                          type="button"
                          variant="ghost"
                          onClick={() => setPostStep(1)}
                        >
                          Zpět
                        </GlowButton>
                        <GlowButton
                          type="button"
                          onClick={() => setPostStep(3)}
                        >
                          Pokračovat
                        </GlowButton>
                      </div>
                    </div>
                  ) : null}

                  {postStep === 3 ? (
                    <div className="mt-6 space-y-4">
                      <label>Popis inzerátu</label>
                      <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 w-full"
                        placeholder="Role, časové možnosti, škola…"
                      />
                      {formError ? (
                        <p className="text-sm text-red-400">{formError}</p>
                      ) : null}
                      <div className="flex gap-2">
                        <GlowButton
                          type="button"
                          variant="ghost"
                          onClick={() => setPostStep(2)}
                        >
                          Zpět
                        </GlowButton>
                        <GlowButton
                          type="button"
                          disabled={submitting || !description.trim()}
                          onClick={() => void onSubmitPost()}
                        >
                          {submitting ? "Odesílám…" : "Přidat"}
                        </GlowButton>
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              {!postSuccess ? (
                <GlowButton
                  type="button"
                  variant="ghost"
                  className="mt-8 !text-xs"
                  onClick={() => {
                    resetPostFlow();
                    setFlow("home");
                  }}
                >
                  Zrušit a zpět
                </GlowButton>
              ) : null}
            </GlassCard>
          </motion.div>
        ) : null}

        {flow === "search" ? (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="mt-10"
          >
            <GlassCard>
              <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
                Hledám tým / hráče
              </h2>

              {searchStep === 0 ? (
                <div className="mt-6 space-y-4">
                  <p className="text-sm text-slate-300">Koho hledáš?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchWant("looking_player");
                      setSearchStep(1);
                    }}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-4 text-left transition-colors hover:border-[#39FF14]/50"
                  >
                    <span className="font-semibold text-[#39FF14]">
                      Hledám hráče
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Inzeráty týmů, které shánějí posilu
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchWant("looking_team");
                      setSearchStep(1);
                    }}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-4 text-left transition-colors hover:border-[#39FF14]/50"
                  >
                    <span className="font-semibold text-[#39FF14]">
                      Hledám tým
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Solo hráči hledající tým
                    </span>
                  </button>
                  <GlowButton
                    type="button"
                    variant="ghost"
                    className="!text-xs"
                    onClick={() => {
                      resetSearchFlow();
                      setFlow("home");
                    }}
                  >
                    Zpět
                  </GlowButton>
                </div>
              ) : null}

              {searchStep === 1 && !searchAnimating ? (
                <div className="mt-6 space-y-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Filtr pro {searchWant ? typeLabel(searchWant) : ""}
                  </p>
                  <div>
                    <label>Min. Faceit level</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={minFaceit}
                      onChange={(e) => setMinFaceit(Number(e.target.value))}
                      className="mt-1 w-full"
                    />
                  </div>
                  <div>
                    <label>Min. hodiny CS2</label>
                    <input
                      type="number"
                      min={0}
                      value={minHours}
                      onChange={(e) => setMinHours(Number(e.target.value))}
                      className="mt-1 w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <GlowButton
                      type="button"
                      variant="ghost"
                      onClick={() => setSearchStep(0)}
                    >
                      Zpět
                    </GlowButton>
                    <GlowButton type="button" onClick={runSearchAnimation}>
                      Vyhledat
                    </GlowButton>
                  </div>
                </div>
              ) : null}

              {searchAnimating ? (
                <motion.div
                  className="mt-10 flex flex-col items-center justify-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-16 w-16 rounded-full border-2 border-[#39FF14]/30 border-t-[#39FF14]"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <p className="mt-6 text-sm text-slate-400">
                    Prohledávám inzeráty…
                  </p>
                </motion.div>
              ) : null}

              {searchStep === 2 && !searchAnimating ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 space-y-4"
                >
                  <p className="text-sm text-slate-400">
                    Nalezeno:{" "}
                    <span className="text-white">{searchResults.length}</span>
                  </p>
                  {loadingPosts ? (
                    <p className="text-slate-500">Načítám…</p>
                  ) : searchResults.length === 0 ? (
                    <p className="text-slate-500">
                      Žádný inzerát nevyhovuje — zkus snížit filtr nebo počkej na
                      nové příspěvky.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((p, i) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <GlassCard>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-[#39FF14]/20 px-2 py-0.5 font-bold uppercase text-[#39FF14]">
                                {typeLabel(p.type)}
                              </span>
                              <span className="text-slate-500">
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
                        </motion.div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-4">
                    <GlowButton
                      type="button"
                      variant="ghost"
                      onClick={() => setSearchStep(1)}
                    >
                      Upravit filtr
                    </GlowButton>
                    <GlowButton
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        resetSearchFlow();
                        setFlow("home");
                      }}
                    >
                      Zpět na výběr
                    </GlowButton>
                  </div>
                </motion.div>
              ) : null}
            </GlassCard>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.main>
  );
}
