"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { GAMES_BY_ID } from "@/lib/games";
import type { RoadmapStageIcon } from "@/lib/tournament-roadmap";
import {
  ROADMAP_DISCIPLINES,
  TOURNAMENT_ROADMAP_STAGES,
} from "@/lib/tournament-roadmap";
import { getTournamentGameLogo } from "@/lib/tournament-game-logos";
import { publicFotky } from "@/lib/public-assets";

function RoadmapIcon({ kind }: { kind: RoadmapStageIcon }) {
  const stroke = "currentColor";
  if (kind === "teams") {
    return (
      <svg
        className="mb-4 h-12 w-12 text-white"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
      >
        <circle cx="18" cy="16" r="5" stroke={stroke} strokeWidth="1.75" />
        <circle cx="30" cy="16" r="5" stroke={stroke} strokeWidth="1.75" />
        <path
          d="M8 38c0-5.5 4.5-10 10-10s10 4.5 10 10M22 38c0-4 3.5-7 8-7s8 3 8 7"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "qualify") {
    return (
      <div
        className="mb-4 grid h-12 w-12 grid-cols-4 grid-rows-4 gap-0.5 text-white"
        aria-hidden
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className={`rounded-[1px] bg-current ${i < 8 ? "opacity-90" : "opacity-35"}`}
          />
        ))}
      </div>
    );
  }
  if (kind === "playoff") {
    return (
      <svg
        className="mb-4 h-12 w-12 text-white"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
      >
        <path
          d="M8 10h12v8H8V10zm20 0h12v8H28V10zM14 26h8v12h-8V26zm12 0h8v12h-8V26z"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M20 14h8M24 22v4"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg
      className="mb-4 h-12 w-12 text-white"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 18L24 12L36 18V30C36 34 32 38 24 40C16 38 12 34 12 30V18Z"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M20 22H28M22 26H26"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GameDisciplineChips({ gameIds }: { gameIds: typeof ROADMAP_DISCIPLINES }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Disciplíny">
      {gameIds.map((id) => {
        const game = GAMES_BY_ID[id];
        return (
          <li key={id}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 py-1 pl-1 pr-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
              <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-white/[0.06]">
                <Image
                  src={getTournamentGameLogo(id)}
                  alt=""
                  width={16}
                  height={16}
                  className="h-3.5 w-3.5 object-contain"
                  draggable={false}
                />
              </span>
              {game.shortLabel}
            </span>
          </li>
        );
      })}
    </ul>
  );
}


function RoadmapGrenades({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const reduceMotion = useReducedMotion();
  const leftY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-38%", "38%"]);
  const leftX = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? ["0%", "0%", "0%"] : ["0%", "14%", "0%"]);
  const leftRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [18, 18] : [8, 32]);

  const rightY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-38%", "38%"]);
  const rightX = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? ["0%", "0%", "0%"] : ["0%", "-14%", "0%"]);
  const rightRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [-16, -16] : [-10, -30]);

  return (
    <>
      <motion.div
        style={{ y: leftY, x: leftX, rotate: leftRotate }}
        className="pointer-events-none absolute -left-[6%] top-1/2 z-0 hidden w-[min(300px,32vw)] -translate-y-1/2 will-change-transform lg:block"
        aria-hidden
      >
        <Image
          src={publicFotky("smoke.png")}
          alt=""
          width={600}
          height={600}
          className="object-contain opacity-[0.92] drop-shadow-[0_0_40px_rgba(57,255,20,0.12)]"
          sizes="300px"
          draggable={false}
        />
      </motion.div>
      <motion.div
        style={{ y: rightY, x: rightX, rotate: rightRotate }}
        className="pointer-events-none absolute -right-[6%] top-1/2 z-0 hidden w-[min(300px,32vw)] -translate-y-1/2 will-change-transform lg:block"
        aria-hidden
      >
        <Image
          src={publicFotky("flashbang.png")}
          alt=""
          width={600}
          height={600}
          className="object-contain opacity-[0.92] drop-shadow-[0_0_40px_rgba(57,255,20,0.1)]"
          sizes="300px"
          draggable={false}
        />
      </motion.div>
    </>
  );
}

export function HomeTournamentRoadmap() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-white/10 bg-[#050505] py-16 sm:py-20"
      aria-labelledby="tournament-roadmap-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_40%,rgba(57,255,20,0.05),transparent_45%),radial-gradient(ellipse_at_85%_60%,rgba(57,255,20,0.04),transparent_40%)]" />

      <RoadmapGrenades scrollYProgress={scrollYProgress} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id="tournament-roadmap-heading"
          className="font-[family-name:var(--font-bebas)] text-center text-3xl uppercase tracking-[0.2em] text-white sm:text-4xl"
        >
          Průběh turnaje
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-500">
          Společný rámec turnaje Sezóny 4 — Counter-Strike 2 a League of Legends.
          Konkrétní formát a termíny najdeš v pravidlech dané hry a v{" "}
          <a href="/oznameni" className="text-[#39FF14] hover:underline">
            Oznámeních
          </a>{" "}
          na webu.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {TOURNAMENT_ROADMAP_STAGES.map((stage, index) => (
            <article
              key={stage.title}
              className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]"
            >
              <div className="relative flex flex-1 flex-col p-5 sm:p-6">
                <div className="pointer-events-none absolute left-5 top-5 h-2 w-2 bg-[#39FF14] shadow-[0_0_10px_#39FF14] sm:left-6 sm:top-6" />
                <p className="absolute right-5 top-5 font-mono text-[10px] text-slate-600 sm:right-6 sm:top-6">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div className="mt-1">
                  <RoadmapIcon kind={stage.icon} />
                </div>
                <h3 className="font-[family-name:var(--font-bebas)] text-xl uppercase tracking-wide text-[#39FF14] drop-shadow-[0_0_12px_rgba(57,255,20,0.2)] sm:text-2xl">
                  {stage.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {stage.description}
                </p>
                <GameDisciplineChips gameIds={stage.games} />
              </div>
              <div className="border-t border-[#39FF14]/30 bg-[#39FF14] px-4 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black sm:text-xs">
                  {stage.dates}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Mobilní timeline — šipky mezi kartami na větším breakpointu nejsou potřeba */}
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-slate-600">
          Sezóna 4 zatím počítá primárně s{" "}
          <strong className="text-slate-400">CS2</strong> a{" "}
          <strong className="text-slate-400">LoL</strong> — ostatní disciplíny
          doplníme v kalendáři, jakmile potvrdíme termíny.
        </p>
      </div>
    </section>
  );
}
