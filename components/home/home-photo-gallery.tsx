"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const photos = [
  {
    src: "/fotky/foto-tym-vitezove.jpeg",
    alt: "Účastníci turnaje s trofejí a cenami v Esport Areně Plzeň",
    className:
      "md:col-span-2 md:row-span-1 min-h-[220px] sm:min-h-[280px] md:min-h-[320px]",
  },
  {
    src: "/fotky/foto-ceny-trofej.jpeg",
    alt: "Ceny od partnerů a trofej na pultu arény v Plzni",
    className: "min-h-[200px] sm:min-h-[240px]",
  },
  {
    src: "/fotky/foto-esport-arena-hraci.jpeg",
    alt: "Hráči při zápase v prostoru Esport Arena",
    className: "min-h-[220px]",
  },
  {
    src: "/fotky/foto-arena-cs2.jpeg",
    alt: "Herní stanice — Counter-Strike 2 na monitoru v aréně",
    className: "min-h-[240px] md:min-h-[280px]",
  },
  {
    src: "/fotky/foto-hrac-zapas.jpeg",
    alt: "Soustředěný hráč u zakřiveného monitoru během zápasu",
    className: "min-h-[220px]",
  },
  {
    src: "/fotky/foto-arena-hyperx.jpeg",
    alt: "Atmosféra herní zóny s RGB osvětlením a profesionálním vybavením",
    className: "min-h-[240px]",
  },
  {
    src: "/fotky/foto-tym-skupina.jpeg",
    alt: "Skupinová fotografie týmů s cenami před logem arény",
    className: "min-h-[200px] sm:min-h-[240px]",
  },
] as const;

export function HomePhotoGallery() {
  return (
    <section
      className="relative border-t border-white/10 bg-[#050505] py-16 sm:py-24"
      aria-labelledby="photo-gallery-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(57,255,20,0.05),transparent_45%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#39FF14]">
            Fotky z akce
          </p>
          <h2
            id="photo-gallery-heading"
            className="mt-2 font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-white sm:text-4xl md:text-5xl"
          >
            SKUTEČNÁ ARÉNA · PLZEŇ
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            Žádné stock fotky — turnaj se hraje v reálném prostoru s ostrým
            osvětlením, pořádnými sestavami a atmosférou offline CS.
          </p>
        </div>

        <div className="mt-12 grid auto-rows-fr gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {photos.map((p, i) => (
            <motion.figure
              key={p.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-32px" }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.36) }}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] ${p.className}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading={i < 2 ? "eager" : "lazy"}
                priority={i === 0}
                draggable={false}
              />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-12 text-left text-[11px] leading-snug text-slate-100 sm:px-4 sm:pb-4 sm:pt-14 sm:text-xs md:text-sm">
                {p.alt}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
