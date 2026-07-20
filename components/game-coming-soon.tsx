"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { gameLabel, type GameId } from "@/lib/games";
import { SEASON_NUMBER } from "@/lib/season-games";
import { getTournamentGameLogo } from "@/lib/tournament-game-logos";

type Props = {
  gameId: GameId;
  variant?: "page" | "card";
  backHref?: string;
  backLabel?: string;
};

function BuildGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-px bg-gradient-to-r from-transparent via-[#39FF14]/40 to-transparent"
          style={{
            top: `${8 + i * 8}%`,
            left: "-20%",
            width: "140%",
          }}
          animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.15, 0.55, 0.15] }}
          transition={{
            duration: 2.8 + (i % 4) * 0.35,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.12,
          }}
        />
      ))}
    </div>
  );
}

export function GameComingSoon({
  gameId,
  variant = "page",
  backHref,
  backLabel,
}: Props) {
  const label = gameLabel(gameId);
  const compact = variant === "card";

  return (
    <motion.div
      initial={{ opacity: 0, y: compact ? 8 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={
        compact
          ? "relative overflow-hidden rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-950/30 via-black/40 to-black/60 px-5 py-6"
          : "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#111111] via-black to-black px-6 py-12 sm:px-10 sm:py-14"
      }
    >
      <BuildGrid />

      <div
        className={`relative z-10 flex flex-col items-center text-center ${compact ? "gap-4" : "gap-6"}`}
      >
        {backHref ? (
          <Link
            href={backHref}
            className="self-start text-sm text-slate-500 transition hover:text-[#39FF14]"
          >
            ← {backLabel ?? "Zpět"}
          </Link>
        ) : null}

        <motion.div
          className="relative"
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className={`flex items-center justify-center rounded-2xl border border-white/10 bg-black/50 ${
              compact ? "h-16 w-16" : "h-24 w-24"
            }`}
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(57,255,20,0)",
                "0 0 28px 2px rgba(57,255,20,0.18)",
                "0 0 0 0 rgba(57,255,20,0)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            <Image
              src={getTournamentGameLogo(gameId)}
              alt=""
              width={compact ? 40 : 56}
              height={compact ? 40 : 56}
              className={compact ? "h-10 w-10 object-contain" : "h-14 w-14 object-contain"}
              draggable={false}
            />
          </motion.div>
          <motion.span
            className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/50 bg-amber-500/20 text-sm"
            animate={{ scale: [1, 1.12, 1], rotate: [0, 12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            aria-hidden
          >
            🛠️
          </motion.span>
        </motion.div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300/90">
            Připravujeme · Sezóna {SEASON_NUMBER}
          </p>
          <h2
            className={`mt-2 font-[family-name:var(--font-bebas)] tracking-wide text-white ${
              compact ? "text-2xl" : "text-4xl sm:text-5xl"
            }`}
          >
            {label}
          </h2>
          <p
            className={`mx-auto mt-3 max-w-md leading-relaxed text-slate-400 ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            Tato stránka se právě staví. V Sezóně {SEASON_NUMBER} hrajeme{" "}
            <span className="text-white">Counter-Strike 2</span> a{" "}
            <span className="text-white">League of Legends</span> — {label} snad
            přibude v další sezóně.
          </p>
        </div>

        <div className="w-full max-w-xs">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#39FF14]/40 via-[#39FF14] to-[#39FF14]/40"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "45%" }}
            />
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Stavíme obsah…
          </p>
        </div>

        {!compact ? (
          <p className="text-sm text-slate-500">
            Sleduj{" "}
            <Link href="/oznameni" className="text-[#39FF14] hover:underline">
              Oznámení
            </Link>{" "}
            — až bude novinka, dáme vědět.
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
