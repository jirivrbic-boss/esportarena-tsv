"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { GlowButton } from "@/components/glow-button";
import { GlassCard } from "@/components/glass-card";
import { completeAuthLanding } from "@/lib/auth-session-client";
import { getFirebaseAuth } from "@/lib/firebase/client";

export default function PrihlaseniPage() {
  const { user, signIn, sendPasswordReset, firebaseReady, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetErr, setResetErr] = useState<string | null>(null);
  const [resetPending, setResetPending] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    void completeAuthLanding(user, router);
  }, [user, loading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firebaseReady) {
      setError("Firebase není nakonfigurováno.");
      return;
    }
    setPending(true);
    try {
      await signIn(email, password);
      const u = getFirebaseAuth().currentUser;
      if (u) {
        await completeAuthLanding(u, router);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Přihlášení selhalo.");
    } finally {
      setPending(false);
    }
  }

  async function onResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetErr(null);
    setResetMsg(null);
    if (!firebaseReady) {
      setResetErr("Firebase není nakonfigurováno.");
      return;
    }
    if (!resetEmail.trim()) {
      setResetErr("Zadej e-mail.");
      return;
    }
    setResetPending(true);
    try {
      await sendPasswordReset(resetEmail.trim());
      setResetMsg(
        "Pokud účet existuje, poslali jsme na zadaný e-mail odkaz pro obnovu hesla. Zkontroluj i spam."
      );
      setResetEmail("");
    } catch (err) {
      setResetErr(err instanceof Error ? err.message : "Odeslání selhalo.");
    } finally {
      setResetPending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Načítání…
      </div>
    );
  }

  return (
    <>
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md px-4 py-20 sm:px-6"
      >
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white">
          Přihlášení kapitána
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Účty zakládají pouze{" "}
          <strong className="text-white">kapitáni týmů</strong>. Hráči se
          neregistrují.
        </p>
        <GlassCard className="mt-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="password">Heslo</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(true);
                    setResetEmail(email);
                    setResetErr(null);
                    setResetMsg(null);
                  }}
                  className="text-xs text-[#39FF14] hover:underline"
                >
                  Zapomněl jsi heslo?
                </button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <GlowButton type="submit" disabled={pending} className="w-full">
              {pending ? "Přihlašuji…" : "Přihlásit se"}
            </GlowButton>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Nemáš účet?{" "}
            <Link href="/registrace" className="text-[#39FF14] hover:underline">
              Registrace kapitána
            </Link>
          </p>
        </GlassCard>
      </motion.main>

      <AnimatePresence>
        {forgotOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-title"
            onClick={() => setForgotOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard>
                <h2
                  id="forgot-title"
                  className="font-[family-name:var(--font-bebas)] text-2xl text-white"
                >
                  Obnova hesla
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Zadej e-mail účtu kapitána. Firebase pošle odkaz na nastavení
                  nového hesla (zkontroluj konzoli Auth → šablony e-mailů).
                </p>
                <form onSubmit={onResetSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="reset-email">E-mail</label>
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  {resetErr ? (
                    <p className="text-sm text-red-400">{resetErr}</p>
                  ) : null}
                  {resetMsg ? (
                    <p className="text-sm text-[#39FF14]">{resetMsg}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <GlowButton type="submit" disabled={resetPending}>
                      {resetPending ? "Odesílám…" : "Poslat odkaz"}
                    </GlowButton>
                    <GlowButton
                      type="button"
                      variant="ghost"
                      onClick={() => setForgotOpen(false)}
                    >
                      Zavřít
                    </GlowButton>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
