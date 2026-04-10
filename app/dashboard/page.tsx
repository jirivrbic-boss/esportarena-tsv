"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";
import { isClientAdminEmail } from "@/lib/admin-client";

const quick = [
  { href: "/dashboard/tymy", label: "Týmy (hry)" },
  { href: "/dashboard/oznameni", label: "Oznámení" },
  { href: "/dashboard/pravidla", label: "Pravidla" },
  { href: "/dashboard/hledam", label: "Hledám tým / hráče" },
  { href: "/dashboard/profil", label: "Profil kapitána" },
];

export default function DashboardHomePage() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading || !user?.email) return;
    if (isClientAdminEmail(user.email) && typeof window !== "undefined") {
      window.location.assign("/admin");
    }
  }, [user, loading]);

  if (!loading && user?.email && isClientAdminEmail(user.email)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Otevírám administraci…
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-10 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Přehled kapitána
      </h1>
      <p className="mt-2 text-slate-400">
        Ahoj{user?.email ? ` (${user.email})` : ""}. Použij menu vlevo nebo
        zkratky níže. Oficiální komunikace je jen na{" "}
        <strong className="text-[#39FF14]">Discordu</strong>.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quick.map((q, i) => (
          <GlassCard key={q.href} delay={i * 0.05}>
            <GlowButton href={q.href} className="w-full !justify-center">
              {q.label}
            </GlowButton>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-8" delay={0.15}>
        <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
          Stav profilu
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {profile?.profileComplete ? (
            <>
              Profil je <span className="text-[#39FF14]">dokončen</span>. Můžeš
              zakládat týmy v jednotlivých hrách.
            </>
          ) : (
            <>
              Doplň prosím{" "}
              <Link href="/dashboard/profil" className="text-[#39FF14] underline">
                profil kapitána
              </Link>{" "}
              (doklady, kontakty).
            </>
          )}
        </p>
      </GlassCard>

      <p className="mt-10 text-center text-sm text-slate-600">
        <Link href="/" className="hover:text-slate-400">
          ← Zpět na úvodní stránku turnaje
        </Link>
      </p>
    </motion.main>
  );
}
