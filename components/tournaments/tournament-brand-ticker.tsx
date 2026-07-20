"use client";

import Image from "next/image";
import { Fragment } from "react";
import type { GameId } from "@/lib/games";
import {
  getTournamentGameLogo,
  TOURNAMENT_BRAND_LOGO,
} from "@/lib/tournament-game-logos";

const TICKER_REPEAT = 10;

type Props = {
  gameId: GameId;
};

export function TournamentBrandTicker({ gameId }: Props) {
  const gameLogo = getTournamentGameLogo(gameId);
  const gameLogoClass =
    gameId === "cs2"
      ? "max-w-[min(168px,32vw)] brightness-0 invert"
      : "max-w-[min(168px,32vw)]";

  const logoPair = (
    <>
      <span className="mx-5 flex shrink-0 items-center sm:mx-6">
        <Image
          src={gameLogo}
          alt=""
          width={220}
          height={48}
          className={`h-auto max-h-10 w-auto object-contain sm:max-h-11 ${gameLogoClass}`}
          draggable={false}
        />
      </span>
      <span className="mx-5 flex shrink-0 items-center sm:mx-6">
        <Image
          src={TOURNAMENT_BRAND_LOGO}
          alt=""
          width={200}
          height={48}
          className="h-auto max-h-10 w-auto max-w-[min(150px,28vw)] object-contain sm:max-h-11"
          draggable={false}
        />
      </span>
    </>
  );

  const renderStrip = (stripId: string) => (
    <div className="flex shrink-0 items-center py-4 sm:py-[1.125rem]">
      {Array.from({ length: TICKER_REPEAT }, (_, index) => (
        <Fragment key={`${stripId}-${index}`}>{logoPair}</Fragment>
      ))}
    </div>
  );

  return (
    <div
      className="relative min-h-[3.25rem] overflow-hidden sm:min-h-[3.5rem]"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#39FF14] via-[#1a3d18] via-45% to-[#050a12]"
        aria-hidden
      />
      <div
        className="tournament-brand-ticker-stripes pointer-events-none absolute inset-0 z-0"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(5,5,5,0.35)_0%,transparent_10%,transparent_90%,rgba(5,5,5,0.35)_100%)]"
        aria-hidden
      />

      <div className="relative z-[1] w-full overflow-hidden">
        <div className="tournament-brand-ticker-track">
          {renderStrip("a")}
          <div aria-hidden>{renderStrip("b")}</div>
        </div>
      </div>
    </div>
  );
}
