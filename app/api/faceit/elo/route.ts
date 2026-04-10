import { NextResponse } from "next/server";
import { fetchFaceitEloByNickname } from "@/lib/faceit-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get("nickname")?.trim();
  if (!nickname) {
    return NextResponse.json(
      { ok: false, error: "Chybí nickname." },
      { status: 400 }
    );
  }

  const { elo, playerId } = await fetchFaceitEloByNickname(nickname);
  return NextResponse.json({ ok: true, elo, playerId });
}
