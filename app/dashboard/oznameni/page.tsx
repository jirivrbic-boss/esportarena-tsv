"use client";

import { motion } from "framer-motion";
import { AnnouncementsList } from "@/components/announcements-list";
import { GlassCard } from "@/components/glass-card";

export default function DashboardOznameniPage() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Oznámení
      </h1>
      <p className="mt-3 text-sm text-slate-400">
        Novinky zveřejňuje administrace. Příspěvky vznikají z vyhrazeného kanálu
        na Discordu (text + volitelně obrázek) — viz skript{" "}
        <code className="text-xs text-slate-500">scripts/discord-announce-bot.mjs</code>{" "}
        v repozitáři.
      </p>
      <GlassCard className="mt-6 border-[#39FF14]/20">
        <p className="text-xs text-slate-500">
          Ve Firebase konzoli vytvoř index pro kolekci{" "}
          <code className="text-slate-400">announcements</code> — pole{" "}
          <code className="text-slate-400">createdAt</code> sestupně, pokud ho
          konzole po prvním načtení vyžádá.
        </p>
      </GlassCard>
      <div className="mt-8">
        <AnnouncementsList />
      </div>
    </motion.main>
  );
}
