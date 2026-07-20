import type { GameId } from "@/lib/games";
import {
  getGameNickExternalUrl,
  getRosterGameNick,
  rosterGameNickLabel,
} from "@/lib/game-player-accounts";
import type { RosterPlayer } from "@/lib/types";

export function RosterPlayerNick({
  player,
  gameId,
  className = "mt-2 text-sm text-[#39FF14] hover:underline",
  emptyClassName = "mt-2 text-sm text-slate-500",
}: {
  player: RosterPlayer;
  gameId: GameId;
  className?: string;
  emptyClassName?: string;
}) {
  const nick = getRosterGameNick(player);
  const label = rosterGameNickLabel(gameId);
  const url = getGameNickExternalUrl(gameId, nick);

  if (!nick) {
    return <p className={emptyClassName}>{label} není vyplněný</p>;
  }

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 ${className}`}
      >
        <span aria-hidden>🎮</span>
        {label}: {nick}
      </a>
    );
  }

  return (
    <p className={className.replace("hover:underline", "")}>
      <span aria-hidden>🎮 </span>
      {label}: {nick}
    </p>
  );
}
