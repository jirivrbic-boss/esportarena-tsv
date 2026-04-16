"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { GlowButton } from "@/components/glow-button";
import type { HomeCms } from "@/lib/cms-defaults";

const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;

function getYoutubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`
        : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`
        : null;
    }

    return null;
  } catch {
    return null;
  }
}

type HeroProps = Pick<
  HomeCms,
  "heroTagline" | "heroTitle" | "heroTitleAccent" | "heroSubtitle" | "heroPoweredBy"
>;

export function Hero({
  heroTagline,
  heroTitle,
  heroTitleAccent,
  heroSubtitle,
  heroPoweredBy,
}: HeroProps) {
  const youtubeEmbedUrl = videoUrl ? getYoutubeEmbedUrl(videoUrl) : null;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#070707] to-[#0a0a0a]" />
      {youtubeEmbedUrl ? (
        <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none">
          <iframe
            src={youtubeEmbedUrl}
            title="Hero video"
            className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "max(100vw, 177.78vh)",
              height: "max(100vh, 56.25vw)",
            }}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : videoUrl ? (
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
          {heroTagline}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="font-[family-name:var(--font-bebas)] text-5xl leading-none tracking-wide text-white sm:text-7xl md:text-8xl"
        >
          {heroTitle}
          <span className="block text-[#39FF14] drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]">
            {heroTitleAccent}
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55 }}
          className="mt-6 max-w-2xl text-lg text-slate-400 whitespace-pre-line"
        >
          {heroSubtitle}
          <br />
          <span className="text-sm text-slate-500">{heroPoweredBy}</span>
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
