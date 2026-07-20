"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PortalHubItem } from "@/lib/portal-hub";

export function PortalHubGrid({
  items,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  items: PortalHubItem[];
  columns?: string;
}) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {items.map((item, i) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Link
            href={item.href}
            className="group flex h-full min-h-[9.5rem] flex-col rounded-2xl border border-white/10 bg-[#111111] p-5 transition hover:border-[#39FF14]/45 hover:bg-[#39FF14]/[0.04]"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-xl transition group-hover:border-[#39FF14]/35">
              {item.icon}
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
              {item.label}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
              {item.description}
            </p>
            <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#39FF14] opacity-80 transition group-hover:opacity-100">
              Otevřít →
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
