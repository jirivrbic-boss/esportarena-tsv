"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { TeamRegistrationForm } from "@/components/team-registration-form";
import Link from "next/link";

export default function DashboardTymRegistracePage() {
  const { user, profile, loading } = useAuth();

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
        Registrace týmu · CS2
      </h1>
      <p className="mt-3 text-sm text-slate-400">
        Přesně <strong className="text-white">4 hráči</strong>, až{" "}
        <strong className="text-white">2 náhradníci</strong> a{" "}
        <strong className="text-white">1 trenér</strong>. Faceit ELO se stáhne
        automaticky pro administrátory (seedování). Nahrané doklady o studiu a
        souhlasy se mažou po 48 h — viz{" "}
        <Link href="/gdpr" className="text-[#39FF14] underline-offset-2 hover:underline">
          GDPR
        </Link>
        .
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
      <div className="mt-10">
        <TeamRegistrationForm user={user} profile={profile} />
      </div>
    </motion.main>
  );
}
