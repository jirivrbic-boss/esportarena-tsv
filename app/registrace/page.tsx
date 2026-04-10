"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { GlowButton } from "@/components/glow-button";
import { GlassCard } from "@/components/glass-card";

export default function RegistracePage() {
  const { user, signUp, firebaseReady, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firebaseReady) {
      setError("Firebase není nakonfigurováno.");
      return;
    }
    if (password.length < 6) {
      setError("Heslo musí mít alespoň 6 znaků.");
      return;
    }
    setPending(true);
    try {
      await signUp(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrace selhala.");
    } finally {
      setPending(false);
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
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md px-4 py-20 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white">
        Registrace kapitána
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Pouze kapitán zakládá účet. Po registraci vyplň profil a nahraj
        potřebné dokumenty. U týmových dokumentů (ISIC, souhlasy) platí automatické
        mazání po 48 h —{" "}
        <Link href="/gdpr" className="text-[#39FF14] hover:underline">
          GDPR
        </Link>
        .
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
            <label htmlFor="password">Heslo</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
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
            {pending ? "Vytvářím účet…" : "Vytvořit účet"}
          </GlowButton>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Už máš účet?{" "}
          <Link href="/prihlaseni" className="text-[#39FF14] hover:underline">
            Přihlásit se
          </Link>
        </p>
      </GlassCard>
    </motion.main>
  );
}
