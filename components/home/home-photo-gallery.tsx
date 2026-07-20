"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { publicFotky } from "@/lib/public-assets";

type GalleryPhoto = {
  src: string;
  alt: string;
  tag: string;
  caption: string;
  /** Pozice v 12-sloupcové mřížce (lg+) */
  placement: string;
  variant: "hero" | "side" | "tile" | "banner";
  /** Vlastní ořez u object-cover (např. skupinová fotka) */
  objectPosition?: string;
};

const photos: GalleryPhoto[] = [
  {
    src: publicFotky("foto-tym-vitezove.jpeg"),
    alt: "Účastníci turnaje s trofejí a cenami v Esport Areně Plzeň",
    tag: "Vítězové",
    caption: "Finálový moment sezóny — tým, trofej a celá aréna.",
    placement:
      "sm:col-span-2 lg:col-span-7 lg:row-span-2 lg:col-start-1 lg:row-start-1 min-h-[280px] sm:min-h-[320px] lg:min-h-0 lg:h-full",
    variant: "hero",
  },
  {
    src: publicFotky("foto-ceny-trofej.jpeg"),
    alt: "Ceny od partnerů a trofej na pultu arény v Plzni",
    tag: "Ceny",
    caption: "Hardware a trofeje od partnerů turnaje.",
    placement:
      "lg:col-span-5 lg:col-start-8 lg:row-start-1 min-h-[200px] lg:min-h-0 lg:h-full",
    variant: "side",
  },
  {
    src: publicFotky("foto-esport-arena-hraci.jpeg"),
    alt: "Hráči při zápase v prostoru Esport Arena",
    tag: "Zápas",
    caption: "Offline duel na stage — žádný ping, jen soustředění.",
    placement:
      "lg:col-span-5 lg:col-start-8 lg:row-start-2 min-h-[200px] lg:min-h-0 lg:h-full",
    variant: "side",
  },
  {
    src: publicFotky("foto-arena-cs2.jpeg"),
    alt: "Herní stanice — Counter-Strike 2 na monitoru v aréně",
    tag: "CS2",
    caption: "Profesionální stanice připravené na kvalifikaci.",
    placement:
      "lg:col-span-4 lg:col-start-1 lg:row-start-3 min-h-[200px] lg:min-h-0 lg:aspect-auto lg:h-full",
    variant: "tile",
  },
  {
    src: publicFotky("foto-hrac-zapas.jpeg"),
    alt: "Soustředěný hráč u zakřiveného monitoru během zápasu",
    tag: "Focus",
    caption: "Každý round se hraje naplno.",
    placement:
      "lg:col-span-4 lg:col-start-5 lg:row-start-3 min-h-[200px] lg:min-h-0 lg:h-full",
    variant: "tile",
  },
  {
    src: publicFotky("foto-arena-hyperx.jpeg"),
    alt: "Atmosféra herní zóny s RGB osvětlením a profesionálním vybavením",
    tag: "Aréna",
    caption: "RGB, monitor wall a atmosféra LAN eventu.",
    placement:
      "lg:col-span-4 lg:col-start-9 lg:row-start-3 min-h-[200px] lg:min-h-0 lg:h-full",
    variant: "tile",
  },
];

function CornerBrackets() {
  return (
    <>
      <span className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[#39FF14]/80" aria-hidden />
      <span className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[#39FF14]/80" aria-hidden />
      <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[#39FF14]/80" aria-hidden />
      <span className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[#39FF14]/80" aria-hidden />
    </>
  );
}

function GalleryTile({
  photo,
  index,
  onOpen,
  reduceMotion,
}: {
  photo: GalleryPhoto;
  index: number;
  onOpen: (index: number) => void;
  reduceMotion: boolean;
}) {
  const { variant } = photo;
  const isHero = variant === "hero";
  const isBanner = variant === "banner";

  return (
    <motion.button
      type="button"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
      onClick={() => onOpen(index)}
      className={`group relative min-h-[200px] overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] text-left transition duration-300 hover:border-[#39FF14]/50 hover:shadow-[0_0_40px_rgba(57,255,20,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]/60 ${photo.placement}`}
      aria-label={`Otevřít fotku: ${photo.caption}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className="object-cover object-center transition duration-700 group-hover:scale-[1.04]"
        style={
          photo.objectPosition
            ? { objectPosition: photo.objectPosition }
            : undefined
        }
        sizes={
          isHero
            ? "(max-width: 1024px) 100vw, 58vw"
            : isBanner
              ? "100vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
        loading={index < 2 ? "eager" : "lazy"}
        priority={index === 0}
        draggable={false}
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 transition group-hover:opacity-95"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[#39FF14]/0 transition duration-500 group-hover:bg-[#39FF14]/[0.07]"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <span className="inline-block rounded-full border border-[#39FF14]/35 bg-black/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#39FF14] backdrop-blur-sm">
          {photo.tag}
        </span>
        {isHero ? (
          <>
            <p className="mt-3 font-[family-name:var(--font-bebas)] text-3xl leading-none tracking-wide text-white sm:text-4xl lg:text-5xl">
              {photo.tag}
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
              {photo.caption}
            </p>
          </>
        ) : (
          <p
            className={`mt-2 leading-snug text-slate-200 ${
              isBanner ? "text-sm sm:text-base" : "text-xs sm:text-sm"
            }`}
          >
            {photo.caption}
          </p>
        )}
      </div>

      <span className="pointer-events-none absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/70 opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100 sm:right-4 sm:top-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden>
          <path d="M15 3h6v6M10 14 21 3M21 10v11H3V3h11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      {isHero ? <CornerBrackets /> : null}
    </motion.button>
  );
}

function GalleryLightbox({
  index,
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = photos[index];

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-[102] flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-[#39FF14]/50 hover:text-[#39FF14]"
        aria-label="Zavřít galerii"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-3 top-1/2 z-[102] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl text-white transition hover:border-[#39FF14]/50 hover:text-[#39FF14] sm:flex"
        aria-label="Předchozí fotka"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-3 top-1/2 z-[102] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl text-white transition hover:border-[#39FF14]/50 hover:text-[#39FF14] sm:flex"
        aria-label="Další fotka"
      >
        ›
      </button>

      <motion.figure
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className="relative z-[101] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a0a] shadow-[0_0_60px_rgba(57,255,20,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-[240px] max-h-[min(72vh,720px)] w-full items-center justify-center bg-[#0a0a0a] px-3 py-4 sm:px-6 sm:py-6">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={1024}
            height={768}
            className="mx-auto h-auto max-h-[min(68vh,640px)] w-auto max-w-full object-contain"
            sizes="(max-width: 1280px) 100vw, 1024px"
            priority
            draggable={false}
          />
        </div>
        <figcaption className="border-t border-white/10 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#39FF14]">
                {photo.tag}
              </p>
              <p className="mt-1 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
                {photo.caption}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {index + 1} / {photos.length}
            </p>
          </div>
        </figcaption>
      </motion.figure>
    </motion.div>
  );
}

export function HomePhotoGallery() {
  const reduceMotion = useReducedMotion();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(() => {
    setLightboxIndex((current) =>
      current == null ? null : (current - 1 + photos.length) % photos.length
    );
  }, []);

  const showNext = useCallback(() => {
    setLightboxIndex((current) =>
      current == null ? null : (current + 1) % photos.length
    );
  }, []);

  useEffect(() => {
    if (lightboxIndex == null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  return (
    <section
      className="relative overflow-hidden border-t border-white/10 bg-[#050505] py-16 sm:py-24"
      aria-labelledby="photo-gallery-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(57,255,20,0.08),transparent_45%),radial-gradient(ellipse_at_80%_100%,rgba(57,255,20,0.04),transparent_40%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#39FF14]">
              Fotky z akce
            </p>
            <h2
              id="photo-gallery-heading"
              className="mt-2 font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl"
            >
              SKUTEČNÁ <span className="text-[#39FF14]">ARÉNA</span> · PLZEŇ
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Offline turnaj v reálném prostoru — žádné stock fotky, jen ostré
              osvětlení a atmosféra LAN.
            </p>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Místo</p>
              <p className="mt-1 font-semibold text-white">Esport Arena</p>
            </div>
            <div className="h-10 w-px bg-white/10" aria-hidden />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Formát</p>
              <p className="mt-1 font-semibold text-white">Offline LAN</p>
            </div>
            <div className="h-10 w-px bg-white/10" aria-hidden />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Galerie</p>
              <p className="mt-1 font-semibold text-[#39FF14]">{photos.length} fotek</p>
            </div>
          </div>
        </div>

        {/* Editoriální mřížka: hero vlevo, 2 vpravo, 3 stejné dole */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-[repeat(2,minmax(210px,1fr))_minmax(200px,1fr)] lg:gap-4">
          {photos.map((photo, i) => (
            <GalleryTile
              key={photo.src}
              photo={photo}
              index={i}
              onOpen={setLightboxIndex}
              reduceMotion={reduceMotion ?? false}
            />
          ))}
        </div>

        <p className="mt-5 text-center text-[11px] text-slate-600 lg:text-left">
          Klikni na fotku pro zvětšení
        </p>
      </div>

      <AnimatePresence>
        {lightboxIndex != null ? (
          <GalleryLightbox
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={showPrev}
            onNext={showNext}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
