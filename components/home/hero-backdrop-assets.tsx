"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

function FloatWrap({
  children,
  yRange,
  duration,
  delay,
  rotate,
}: {
  children: ReactNode;
  yRange: number;
  duration: number;
  delay: number;
  rotate?: number;
}) {
  return (
    <motion.div
      className="relative"
      animate={{
        y: [0, -yRange, 0],
        rotate: rotate
          ? [0, rotate, -rotate * 0.6, 0]
          : [0, 0.8, -0.5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/** 3D rendery na černém pozadí — dekorace hero sekce (parallax drží rodič). */
export function HeroBackdropAssets() {
  return (
    <>
      <div className="absolute -bottom-4 -left-4 hidden w-[min(38vw,340px)] md:block lg:left-0 lg:w-[min(34vw,380px)]">
        <div className="absolute inset-0 scale-110 rounded-full bg-[#39FF14]/[0.07] blur-3xl" />
        <FloatWrap yRange={10} duration={5.2} delay={0}>
          <Image
            src="/fotky/m4a4.png"
            alt=""
            width={760}
            height={428}
            className="relative h-auto w-full object-contain opacity-90 [filter:drop-shadow(0_0_28px_rgba(57,255,20,0.18))]"
            sizes="(max-width: 1024px) 38vw, 380px"
            draggable={false}
          />
        </FloatWrap>
      </div>

      <div className="absolute -bottom-8 -right-6 w-[min(72vw,440px)] sm:-right-10 sm:w-[min(65vw,480px)] md:w-[min(48vw,520px)] lg:-right-4 lg:bottom-0 lg:w-[min(42vw,560px)]">
        <div className="absolute inset-0 translate-x-4 translate-y-8 scale-125 rounded-full bg-[#39FF14]/[0.09] blur-3xl" />
        <FloatWrap yRange={14} duration={4.8} delay={0.35} rotate={1.2}>
          <Image
            src="/fotky/agent.png"
            alt=""
            width={900}
            height={900}
            className="relative h-auto w-full object-contain opacity-95 [filter:drop-shadow(0_0_36px_rgba(57,255,20,0.2))]"
            sizes="(max-width: 768px) 72vw, 520px"
            priority
            draggable={false}
          />
        </FloatWrap>
      </div>

      <div className="absolute right-[8%] top-[14%] hidden w-[min(26vw,220px)] xl:block 2xl:right-[12%]">
        <div className="absolute inset-0 scale-150 bg-[#39FF14]/[0.06] blur-2xl" />
        <FloatWrap yRange={8} duration={5.8} delay={0.7}>
          <Image
            src="/fotky/ak-47.png"
            alt=""
            width={640}
            height={360}
            className="relative h-auto w-full object-contain opacity-85 [filter:drop-shadow(0_0_24px_rgba(57,255,20,0.15))]"
            sizes="220px"
            draggable={false}
          />
        </FloatWrap>
      </div>
    </>
  );
}
