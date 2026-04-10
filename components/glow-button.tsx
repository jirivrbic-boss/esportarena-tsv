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
    "relative inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";
  const styles =
    variant === "primary"
      ? "bg-[#39FF14] text-black shadow-[0_0_24px_rgba(57,255,20,0.35)] hover:shadow-[0_0_36px_rgba(57,255,20,0.55)]"
      : "border border-white/15 bg-white/5 text-white hover:border-[#39FF14]/40 hover:bg-white/10";

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring" as const, stiffness: 400, damping: 24 },
  };

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest;
    return (
      <motion.span className="inline-block" {...motionProps}>
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
    <motion.span className="inline-block" {...motionProps}>
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
