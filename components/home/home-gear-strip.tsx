"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const items = [
  {
    src: "/fotky/smoke.png",
    alt: "Smoke granát",
    w: 480,
    h: 480,
    className: "w-[min(42vw,160px)] sm:w-44",
    duration: 4.2,
    delay: 0,
  },
  {
    src: "/fotky/flashbang.png",
    alt: "Flashbang",
    w: 480,
    h: 480,
    className: "w-[min(42vw,160px)] sm:w-44",
    duration: 4.8,
    delay: 0.4,
  },
  {
    src: "/fotky/klavesnice.png",
    alt: "Herní klávesnice",
    w: 800,
    h: 600,
    className: "w-[min(88vw,280px)] sm:w-72",
    duration: 5.4,
    delay: 0.15,
  },
  {
    src: "/fotky/sluchatka.png",
    alt: "Herní headset",
    w: 720,
    h: 720,
    className: "w-[min(55vw,200px)] sm:w-52",
    duration: 5,
    delay: 0.55,
  },
  {
    src: "/fotky/mys.png",
    alt: "Herní myš",
    w: 720,
    h: 720,
    className: "w-[min(50vw,190px)] sm:w-48",
    duration: 4.6,
    delay: 0.25,
  },
] as const;

export function HomeGearStrip() {
  return (
    <section
      className="relative overflow-hidden border-t border-white/10 py-16 sm:py-24"
      aria-labelledby="gear-strip-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(57,255,20,0.06),transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(57,255,20,0.05),transparent_45%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#39FF14]">
            Atmosféra arény
          </p>
          <h2
            id="gear-strip-heading"
            className="mt-2 font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-white sm:text-4xl md:text-5xl"
          >
            NA PLACE I ZA MONITOREM
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            Taktika, mechanika a setup — stejná zelená energie jako v CS2. Modely
            doplňují tmavý web a lehce se hýbou, aby působily živěji.
          </p>
        </div>

        <div className="mt-14 flex flex-wrap items-end justify-center gap-x-6 gap-y-10 sm:gap-x-10 md:gap-x-12">
          {items.map((item) => (
            <motion.div
              key={item.src}
              className={`relative flex flex-col items-center ${item.className}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: item.delay * 0.3 }}
            >
              <div className="absolute -inset-6 rounded-full bg-[#39FF14]/[0.05] blur-2xl" />
              <motion.div
                className="relative w-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: item.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: item.delay,
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={item.w}
                  height={item.h}
                  className="h-auto w-full object-contain [filter:drop-shadow(0_0_20px_rgba(57,255,20,0.12))]"
                  sizes="(max-width: 640px) 42vw, 280px"
                  draggable={false}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
