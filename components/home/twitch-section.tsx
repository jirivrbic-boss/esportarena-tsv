"use client";

import dynamic from "next/dynamic";

const TwitchHub = dynamic(
  () =>
    import("./twitch-embed").then((m) => ({
      default: m.TwitchHub,
    })),
  { ssr: false, loading: () => null }
);

export function TwitchSection() {
  return <TwitchHub />;
}
