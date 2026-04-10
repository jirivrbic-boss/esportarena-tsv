const FACEIT_BASE = "https://open.faceit.com/data/v4";

export async function fetchFaceitEloByNickname(
  nickname: string
): Promise<{ elo: number | null; playerId: string | null }> {
  const key = process.env.FACEIT_API_KEY;
  if (!key?.trim()) {
    return { elo: null, playerId: null };
  }
  const url = `${FACEIT_BASE}/players?nickname=${encodeURIComponent(nickname.trim())}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return { elo: null, playerId: null };
  }
  const data = (await res.json()) as {
    player_id?: string;
    games?: {
      cs2?: { faceit_elo?: number };
      csgo?: { faceit_elo?: number };
    };
  };
  const elo =
    data.games?.cs2?.faceit_elo ??
    data.games?.csgo?.faceit_elo ??
    null;
  const playerId = data.player_id ?? null;
  return { elo, playerId };
}
