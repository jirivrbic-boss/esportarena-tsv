"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { publicFotky } from "@/lib/public-assets";

type Placement = {
  rank: 1 | 2 | 3;
  team: string;
};

type Season = {
  id: string;
  label: string;
  subtitle: string;
  photo: string;
  photoAlt: string;
  featured?: boolean;
  placements: Placement[];
};

const seasons: Season[] = [
  {
    id: "s1",
    label: "Sezóna 1",
    subtitle: "První ročník · CS2",
    photo: "6045DEDD-AAA6-42A2-9D70-AF0908E8C35E_1_105_c.jpeg",
    photoAlt: "Vítězný tým prvního ročníku studentského turnaje v Esport Areně Plzeň",
    placements: [
      { rank: 1, team: "SPŠ MV Praha (Sokolov)" },
      { rank: 2, team: "Gymnázium Třeboň" },
      { rank: 3, team: "SPŠ Mladá Boleslav" },
    ],
  },
  {
    id: "s2",
    label: "Sezóna 2",
    subtitle: "Druhý ročník · CS2",
    photo: "A4D52AE1-91A9-40DA-9336-7188338C8511_1_105_c.jpeg",
    photoAlt: "Vítězný tým druhého ročníku studentského turnaje v Esport Areně Plzeň",
    placements: [
      { rank: 1, team: "SPŠEK Rakovník" },
      { rank: 2, team: "SPŠ MV Praha (Sokolov)" },
      { rank: 3, team: "SPŠ Teplice" },
    ],
  },
  {
    id: "s3",
    label: "Sezóna 3",
    subtitle: "Třetí ročník · CS2",
    photo: "B6017711-733C-42F5-944D-8AEC929677E6_1_105_c.jpeg",
    photoAlt: "Vítězný tým třetího ročníku studentského turnaje v Esport Areně Plzeň",
    featured: true,
    placements: [
      { rank: 1, team: "VUT Brno" },
      { rank: 2, team: "VŠB Ostrava" },
      { rank: 3, team: "FEKT VUT Brno" },
    ],
  },
];

const medalStyle: Record<
  1 | 2 | 3,
  { label: string; ring: string; text: string; bar: string; glow: string }
> = {
  1: {
    label: "1. místo",
    ring: "border-[#e8c547]/60 bg-[#e8c547]/15 text-[#f5d76e]",
    text: "text-[#f5d76e]",
    bar: "from-[#e8c547]/80 to-[#c9a227]/40",
    glow: "shadow-[0_0_24px_rgba(232,197,71,0.25)]",
  },
  2: {
    label: "2. místo",
    ring: "border-slate-300/40 bg-slate-300/10 text-slate-200",
    text: "text-slate-100",
    bar: "from-slate-300/60 to-slate-500/30",
    glow: "",
  },
  3: {
    label: "3. místo",
    ring: "border-[#cd7f32]/50 bg-[#cd7f32]/10 text-[#d4956a]",
    text: "text-[#d4956a]",
    bar: "from-[#cd7f32]/70 to-[#8b5a2b]/30",
    glow: "",
  },
};

function MedalBadge({ rank }: { rank: 1 | 2 | 3 }) {
  const style = medalStyle[rank];
  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-black ${style.ring}`}
      aria-hidden
    >
      {rank}
    </span>
  );
}

function SeasonPlaque({
  season,
  index,
  reduceMotion,
}: {
  season: Season;
  index: number;
  reduceMotion: boolean;
}) {
  const champion = season.placements.find((p) => p.rank === 1)!;
  const featured = season.featured;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-[#0a0a0a] transition duration-500 ${
        featured
          ? "border-[#39FF14]/35 shadow-[0_0_48px_rgba(57,255,20,0.12)] md:-translate-y-6 md:scale-[1.04]"
          : "border-white/10 hover:border-[#39FF14]/25 hover:shadow-[0_0_32px_rgba(57,255,20,0.08)]"
      }`}
    >
      {featured ? (
        <div className="pointer-events-none absolute -inset-px z-10 rounded-2xl bg-gradient-to-b from-[#39FF14]/20 via-transparent to-transparent opacity-60" aria-hidden />
      ) : null}

      {/* Fotka vítězů */}
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/11]">
        <Image
          src={publicFotky(season.photo)}
          alt={season.photoAlt}
          fill
          className="object-cover object-center transition duration-700 group-hover:scale-[1.05]"
          sizes="(max-width: 768px) 100vw, 33vw"
          loading={index === 0 ? "eager" : "lazy"}
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[#39FF14]/0 transition duration-500 group-hover:bg-[#39FF14]/[0.06]" aria-hidden />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#39FF14]">
              {season.label}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{season.subtitle}</p>
          </div>
          {featured ? (
            <span className="rounded-full border border-[#39FF14]/40 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#39FF14] backdrop-blur-sm">
              Poslední šampion
            </span>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className={`inline-flex items-center gap-2 rounded-lg border border-[#e8c547]/30 bg-black/70 px-3 py-2 backdrop-blur-md ${medalStyle[1].glow}`}>
            <MedalBadge rank={1} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#e8c547]">
                Šampion
              </p>
              <p className="truncate font-[family-name:var(--font-bebas)] text-xl tracking-wide text-white">
                {champion.team}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stupně vítězů */}
      <div className="relative flex flex-1 flex-col gap-0 border-t border-white/10 p-4 sm:p-5">
        {season.placements.map((p) => {
          const style = medalStyle[p.rank];
          return (
            <div
              key={p.rank}
              className={`relative flex items-center gap-3 border-b border-white/5 py-3 last:border-0 last:pb-0 first:pt-0 ${
                p.rank === 1 ? "pb-4" : ""
              }`}
            >
              <div
                className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b ${style.bar} ${
                  p.rank === 1 ? "opacity-100" : "opacity-70"
                }`}
                aria-hidden
              />
              <div className="pl-3">
                <MedalBadge rank={p.rank} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {style.label}
                </p>
                <p
                  className={`mt-0.5 truncate font-semibold ${
                    p.rank === 1 ? `text-lg ${style.text}` : p.rank === 2 ? "text-base text-slate-200" : "text-base text-slate-400"
                  }`}
                >
                  {p.team}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.article>
  );
}

export function HallOfFame() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden border-t border-white/10 bg-[#060606] py-20 sm:py-28"
      aria-labelledby="hall-of-fame-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,197,71,0.07),transparent_50%),radial-gradient(ellipse_at_20%_100%,rgba(57,255,20,0.05),transparent_45%),radial-gradient(ellipse_at_80%_80%,rgba(57,255,20,0.04),transparent_40%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hlavička */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e8c547]">
              Legendy turnaje
            </p>
            <h2
              id="hall-of-fame-heading"
              className="mt-2 font-[family-name:var(--font-bebas)] text-5xl leading-none tracking-wide text-white sm:text-6xl md:text-7xl"
            >
              SÍŇ <span className="text-[#39FF14]">SLÁVY</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
              Tři ročníky. Devět finalistů. Školy i univerzity, které psaly historii
              největšího studentského CS turnaje v Česku — v reálné aréně v Plzni.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              {[
                { n: "3", label: "ročníky" },
                { n: "9", label: "medailistů" },
                { n: "1", label: "aréna · Plzeň" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm"
                >
                  <p className="font-[family-name:var(--font-bebas)] text-3xl leading-none text-[#39FF14]">
                    {stat.n}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[220px] shrink-0 lg:mx-0 lg:max-w-[260px]">
            <div className="pointer-events-none absolute inset-0 scale-125 rounded-full bg-[#e8c547]/[0.12] blur-3xl" />
            <div className="pointer-events-none absolute inset-0 scale-110 rounded-full bg-[#39FF14]/[0.08] blur-2xl" />
            <motion.div
              className="relative"
              animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={publicFotky("pohar.png")}
                alt="Trofej pro vítěze turnaje"
                width={520}
                height={520}
                className="h-auto w-full object-contain [filter:drop-shadow(0_0_40px_rgba(232,197,71,0.35))]"
                sizes="260px"
                draggable={false}
              />
            </motion.div>
          </div>
        </div>

        {/* Časová osa */}
        <div className="relative mt-14 hidden md:block" aria-hidden>
          <div className="absolute left-[16.666%] right-[16.666%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#39FF14]/30 to-transparent" />
          <div className="grid grid-cols-3">
            {[seasons[0], seasons[2], seasons[1]].map((s) => (
              <div key={s.id} className="flex justify-center">
                <span className="rounded-full border border-[#39FF14]/30 bg-[#0a0a0a] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#39FF14]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Karty ročníků — S3 uprostřed na pódiu */}
        <div className="mt-8 grid items-end gap-6 md:mt-12 md:grid-cols-3 md:gap-5 lg:gap-6">
          {seasons.map((season, i) => (
            <div
              key={season.id}
              className={
                season.id === "s1"
                  ? "md:order-1"
                  : season.id === "s3"
                    ? "md:order-2"
                    : "md:order-3"
              }
            >
              <SeasonPlaque
                season={season}
                index={i}
                reduceMotion={reduceMotion ?? false}
              />
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-600">
          Sezóna 4 právě píše další kapitolu — přidej se mezi legendy.
        </p>
      </div>
    </section>
  );
}
