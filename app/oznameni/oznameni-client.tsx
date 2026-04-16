"use client";

import { motion } from "framer-motion";
import { AnnouncementsList } from "@/components/announcements-list";

export function OznameniClient({ intro }: { intro: string }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Oznámení
      </h1>
      <p className="mt-3 text-sm text-slate-400 whitespace-pre-line">{intro}</p>
      <p className="mt-2 text-sm text-slate-400">
        Jsi přihlášený kapitán? Stejný obsah najdeš i v{" "}
        <a href="/dashboard/oznameni" className="text-[#39FF14] hover:underline">
          přehledu kapitána
        </a>
        .
      </p>
      <div className="mt-10">
        <AnnouncementsList />
      </div>
    </motion.main>
  );
}
