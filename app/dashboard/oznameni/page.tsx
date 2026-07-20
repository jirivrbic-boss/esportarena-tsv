"use client";

import { motion } from "framer-motion";
import { AnnouncementsList } from "@/components/announcements-list";

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
        Hlavní zdroj novinek turnaje. Každé oznámení zveřejníme tady — stejný obsah
        posíláme i na Discord. Sleduj tuto sekci kvůli termínům, změnám a organizačním
        pokynům.
      </p>
      <div className="mt-8">
        <AnnouncementsList />
      </div>
    </motion.main>
  );
}
