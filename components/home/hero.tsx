"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { GlowButton } from "@/components/glow-button";

const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;

export function Hero() {
  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#070707] to-[#0a0a0a]" />
      {videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
          poster="/fotky/tournament%20logo.png"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,#050505_0%,transparent_45%)]" />

      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col items-center justify-center px-4 pb-24 pt-28 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8 h-28 w-28 sm:h-36 sm:w-36"
        >
          <div className="absolute inset-0 rounded-2xl bg-[#39FF14]/20 blur-3xl" />
          <Image
            src="/fotky/tournament%20logo.png"
            alt="Logo turnaje"
            fill
            className="relative object-contain drop-shadow-[0_0_28px_rgba(57,255,20,0.45)]"
            priority
            sizes="144px"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#39FF14]"
        >
          Counter-Strike 2 · České školy
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="font-[family-name:var(--font-bebas)] text-5xl leading-none tracking-wide text-white sm:text-7xl md:text-8xl"
        >
          ESPORTARENA
          <span className="block text-[#39FF14] drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]">
            TSV
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55 }}
          className="mt-6 max-w-2xl text-lg text-slate-400"
        >
          Sezóna 4 · Prize pool{" "}
          <span className="font-semibold text-white">120 000 Kč</span>
          <br />
          <span className="text-sm text-slate-500">
            Powered by Cougar & EsportArena Plzeň
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <GlowButton href="/tym/registrace">Registrovat tým</GlowButton>
          <GlowButton href="/hledam" variant="ghost">
            Hledám tým / hráče
          </GlowButton>
        </motion.div>
      </div>
    </section>
  );
}
