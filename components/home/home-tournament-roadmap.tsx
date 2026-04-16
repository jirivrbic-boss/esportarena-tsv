import Image from "next/image";
import { Fragment } from "react";
import type { RoadmapStageIcon } from "@/lib/tournament-roadmap";
import { TOURNAMENT_ROADMAP_STAGES } from "@/lib/tournament-roadmap";

function RoadmapIcon({ kind }: { kind: RoadmapStageIcon }) {
  const stroke = "currentColor";
  if (kind === "grid") {
    return (
      <div
        className="mb-4 grid h-12 w-12 grid-cols-4 grid-rows-4 gap-0.5 text-white"
        aria-hidden
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="rounded-[1px] bg-current opacity-90" />
        ))}
      </div>
    );
  }
  if (kind === "sixteen") {
    return (
      <div
        className="mb-4 flex h-12 items-center gap-2 text-white"
        aria-hidden
      >
        <span className="font-[family-name:var(--font-bebas)] text-3xl leading-none tracking-wide">
          16
        </span>
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          className="shrink-0 opacity-95"
        >
          <path
            d="M18 4L30 12V24L18 32L6 24V12L18 4Z"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M18 10L24 14.5V23.5L18 28L12 23.5V14.5L18 10Z"
            stroke={stroke}
            strokeWidth="1.2"
            opacity="0.65"
          />
        </svg>
      </div>
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

function StageConnector() {
  return (
    <div
      className="hidden shrink-0 items-center justify-center self-stretch md:flex md:w-9 lg:w-10"
      aria-hidden
    >
      <div className="relative flex h-full min-h-[120px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-[#39FF14]/25 bg-gradient-to-b from-[#39FF14]/[0.07] via-white/[0.03] to-[#39FF14]/[0.05] shadow-[0_0_24px_rgba(57,255,20,0.08),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div
          className="pointer-events-none absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#39FF14]/35 to-transparent"
          aria-hidden
        />
        <svg
          width="28"
          height="40"
          viewBox="0 0 28 40"
          fill="none"
          className="relative z-[1] text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.55)]"
        >
          <path
            d="M6 10l8 10-8 10M14 10l8 10-8 10"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function HomeTournamentRoadmap() {
  return (
    <section
      className="relative overflow-hidden border-t border-white/10 bg-[#050505] py-16 sm:py-20"
      aria-labelledby="tournament-roadmap-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_40%,rgba(57,255,20,0.05),transparent_45%),radial-gradient(ellipse_at_85%_60%,rgba(57,255,20,0.04),transparent_40%)]" />

      <div className="pointer-events-none absolute -left-[6%] top-1/2 z-0 hidden w-[min(300px,32vw)] -translate-y-1/2 lg:block">
        <Image
          src="/fotky/smoke.png"
          alt=""
          width={600}
          height={600}
          className="rotate-[18deg] object-contain opacity-[0.92] drop-shadow-[0_0_40px_rgba(57,255,20,0.12)]"
          sizes="300px"
          draggable={false}
        />
      </div>
      <div className="pointer-events-none absolute -right-[6%] top-1/2 z-0 hidden w-[min(300px,32vw)] -translate-y-1/2 lg:block">
        <Image
          src="/fotky/flashbang.png"
          alt=""
          width={600}
          height={600}
          className="-rotate-[16deg] object-contain opacity-[0.92] drop-shadow-[0_0_40px_rgba(57,255,20,0.1)]"
          sizes="300px"
          draggable={false}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id="tournament-roadmap-heading"
          className="font-[family-name:var(--font-bebas)] text-center text-3xl uppercase tracking-[0.2em] text-white sm:text-4xl"
        >
          Průběh turnaje
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-500">
          Od kvalifikace po finále — přehled fází a formátu.
        </p>

        <div className="mt-12 flex flex-col gap-6 md:mt-14 md:flex-row md:items-stretch md:justify-center md:gap-3 lg:gap-4">
          {TOURNAMENT_ROADMAP_STAGES.map((stage, index) => (
            <Fragment key={stage.title}>
              {index > 0 ? <StageConnector /> : null}
              <article className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
                <div className="relative flex flex-1 flex-col p-5 sm:p-6">
                  <div className="pointer-events-none absolute left-5 top-5 h-2 w-2 bg-[#39FF14] shadow-[0_0_10px_#39FF14] sm:left-6 sm:top-6" />
                  <div className="mt-1">
                    <RoadmapIcon kind={stage.icon} />
                  </div>
                  <h3 className="font-[family-name:var(--font-bebas)] text-xl uppercase tracking-wide text-[#39FF14] drop-shadow-[0_0_12px_rgba(57,255,20,0.2)] sm:text-2xl">
                    {stage.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {stage.description}
                  </p>
                </div>
                <div className="border-t border-[#39FF14]/30 bg-[#39FF14] px-4 py-3 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-black">
                    {stage.dates}
                  </p>
                </div>
              </article>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
