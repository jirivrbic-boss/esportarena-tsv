"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { GlowButton } from "@/components/glow-button";
import type { HomeCms } from "@/lib/cms-defaults";
import { publicFotky } from "@/lib/public-assets";

const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() || "";
const tournamentLogo = publicFotky("tournament logo.png");

function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace(/^\//, "").split("/")[0];
      return videoId || null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery) return fromQuery;
      const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
      return embedMatch?.[1] ?? null;
    }

    return null;
  } catch {
    return null;
  }
}

function youtubeThumbnailUrl(videoId: string, quality: "maxres" | "hq" = "maxres") {
  const file = quality === "maxres" ? "maxresdefault" : "hqdefault";
  return `https://i.ytimg.com/vi/${videoId}/${file}.jpg`;
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
  const youtubeVideoId = videoUrl ? extractYoutubeVideoId(videoUrl) : null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const onVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || youtubeVideoId) return;

    const startPlayback = () => {
      onVideoReady();
      void video.play().catch(() => {});
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      startPlayback();
      return;
    }

    video.addEventListener("loadeddata", startPlayback, { once: true });
    video.addEventListener("canplay", startPlayback, { once: true });

    return () => {
      video.removeEventListener("loadeddata", startPlayback);
      video.removeEventListener("canplay", startPlayback);
    };
  }, [videoUrl, youtubeVideoId, onVideoReady]);

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#070707] to-[#0a0a0a]" />
      {youtubeVideoId ? (
        <>
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {/* YouTube iframe v Safari vykresluje play/pause nad obsahem — použijeme náhled + jemný zoom */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={youtubeThumbnailUrl(youtubeVideoId)}
              alt=""
              className="hero-bg-zoom absolute inset-0 h-full w-full object-cover opacity-45"
              onError={(event) => {
                const img = event.currentTarget;
                if (!img.src.includes("hqdefault")) {
                  img.src = youtubeThumbnailUrl(youtubeVideoId, "hq");
                }
              }}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-black/35"
            aria-hidden
          />
        </>
      ) : videoUrl ? (
        <video
          ref={videoRef}
          className={`pointer-events-none absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-500 ${
            videoReady ? "opacity-40" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          aria-hidden
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.06),transparent_58%)]" />
      )}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(to_top,#050505_0%,transparent_45%)]" />

      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col items-center justify-center px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8 h-28 w-28 sm:h-36 sm:w-36"
        >
          <div className="absolute inset-0 rounded-2xl bg-[#39FF14]/20 blur-3xl" />
          <Image
            src={tournamentLogo}
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
          className="mt-10 flex w-full max-w-lg flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4"
        >
          <GlowButton
            href="/tym/registrace"
            className="h-12 !py-0 w-full min-w-0 justify-center sm:w-auto sm:min-w-[15rem]"
          >
            Registrovat tým
          </GlowButton>
          <GlowButton
            href="/hledam"
            variant="ghost"
            className="h-12 !py-0 w-full min-w-0 justify-center sm:w-auto sm:min-w-[15rem]"
          >
            Hledám tým / hráče
          </GlowButton>
        </motion.div>
      </div>
    </section>
  );
}
