"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";

const channel =
  process.env.NEXT_PUBLIC_TWITCH_CHANNEL?.trim() || "spajkk";

export function TwitchHub() {
  const [enabled, setEnabled] = useState(false);
  const parent =
    typeof window !== "undefined" ? window.location.hostname : "localhost";

  const src = `https://player.twitch.tv/?channel=${encodeURIComponent(
    channel
  )}&parent=${encodeURIComponent(parent)}`;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-[family-name:var(--font-bebas)] text-4xl tracking-[0.08em] text-white sm:text-5xl">
          OFICIÁLNÍ <span className="text-[#39FF14]">STREAM</span>
        </h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          Jediný oficiální přenos turnaje — žádné rozptýlené kanály. Sleduj
          přímo zde.
        </p>
        <GlassCard className="mt-8 overflow-hidden p-0">
          <div className="aspect-video w-full bg-black">
            {enabled ? (
              <iframe
                title="Twitch — oficiální kanál"
                src={src}
                allowFullScreen
                loading="lazy"
                height="100%"
                width="100%"
                className="h-full min-h-[240px] w-full sm:min-h-[360px]"
                suppressHydrationWarning
              />
            ) : (
              <div className="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-3 px-4 text-center sm:min-h-[360px]">
                <p className="text-sm text-slate-300">
                  Twitch stream se načte až po kliknutí, aby byl web rychlejší.
                </p>
                <button
                  type="button"
                  onClick={() => setEnabled(true)}
                  className="rounded-lg border border-[#39FF14]/50 bg-[#39FF14]/15 px-4 py-2 text-sm font-semibold text-[#39FF14] transition-colors hover:bg-[#39FF14]/25"
                >
                  Spustit stream
                </button>
              </div>
            )}
          </div>
        </GlassCard>
        <p className="mt-3 text-center text-xs text-slate-500">
          Kanál: <span className="text-slate-400">{channel}</span> · nastavitelné
          přes NEXT_PUBLIC_TWITCH_CHANNEL
        </p>
      </div>
    </section>
  );
}
