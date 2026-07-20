"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { GlassCard } from "@/components/glass-card";
import { PortalHubGrid } from "@/components/portal-hub-grid";
import { CAPTAIN_HUB_SECTIONS } from "@/lib/portal-hub";
import { ANNOUNCEMENTS_HREF, SITE_COPY } from "@/lib/site-copy";

export default function DashboardHomePage() {
  const { user, profile } = useAuth();

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Přehled kapitána
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Ahoj{user?.email ? ` (${user.email})` : ""}. Vyber sekci — každá má vlastní
        stránku. {SITE_COPY.announcementsShort}{" "}
        <Link href={ANNOUNCEMENTS_HREF} className="text-[#39FF14] hover:underline">
          Veřejná oznámení →
        </Link>
      </p>

      <div className="mt-10">
        <PortalHubGrid items={CAPTAIN_HUB_SECTIONS} />
      </div>

      <GlassCard className="mt-10" delay={0.15}>
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
              (doklady, kontakty) — bez toho nejde založit tým.
            </>
          )}
        </p>
        {!profile?.profileComplete ? (
          <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-amber-200/85">
            Tým založíš až po dokončeném profilu
          </p>
        ) : null}
      </GlassCard>

      <p className="mt-10 text-center text-sm text-slate-600">
        <Link href="/" className="hover:text-slate-400">
          ← Zpět na úvodní stránku turnaje
        </Link>
      </p>
    </motion.main>
  );
}
