"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ComponentProps } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost";
} & (
  | ({ href: string } & Omit<ComponentProps<typeof Link>, "href" | "className">)
  | ({ href?: undefined } & ComponentProps<"button">)
);

export function GlowButton({
  children,
  className = "",
  variant = "primary",
  ...rest
}: Props) {
  const base =
    "relative box-border inline-flex max-w-full items-center justify-center whitespace-nowrap rounded-lg px-4 py-3 text-xs font-semibold uppercase leading-tight tracking-wider transition-shadow touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] sm:px-6 sm:text-sm";
  const styles =
    variant === "primary"
      ? "border border-[#39FF14]/40 bg-[#39FF14] text-black shadow-[0_0_14px_rgba(57,255,20,0.28)] hover:shadow-[0_0_22px_rgba(57,255,20,0.42)]"
      : "border border-white/15 bg-white/5 text-white hover:border-[#39FF14]/40 hover:bg-white/10";

  const motionProps = {
    whileHover: { scale: 1.015 },
    whileTap: { scale: 0.985 },
    transition: { type: "spring" as const, stiffness: 400, damping: 24 },
  };

  const stretch = /\bw-full\b/.test(className);
  const wrapClass = stretch ? "flex w-full max-w-full" : "inline-flex max-w-full";

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest;
    return (
      <motion.span className={wrapClass} {...motionProps}>
        <Link
          href={href}
          className={`${base} ${styles} ${className}`}
          {...linkRest}
        >
          {children}
        </Link>
      </motion.span>
    );
  }

  const buttonRest = rest as ComponentProps<"button">;
  return (
    <motion.span className={wrapClass} {...motionProps}>
      <button
        type={buttonRest.type ?? "button"}
        className={`${base} ${styles} ${className}`}
        {...buttonRest}
      >
        {children}
      </button>
    </motion.span>
  );
}
