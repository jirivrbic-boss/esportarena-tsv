import { NextResponse } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase/admin";
import { notifyDiscordFaceitHubEntry } from "@/lib/discord-webhook";
import { gameLabel, type GameId } from "@/lib/games";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";

export async function POST(request: Request) {
  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!user?.uid) {
    return NextResponse.json(
      { ok: false, error: "Chybí nebo neplatný token." },
      { status: 401 }
    );
  }

  let body: { teamId?: string };
  try {
    body = (await request.json()) as { teamId?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }
  const teamId = typeof body.teamId === "string" ? body.teamId.trim() : "";
  if (!teamId) {
    return NextResponse.json({ ok: false, error: "Chybí teamId." }, { status: 400 });
  }

  try {
    getAdminApp();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Firebase Admin není nakonfigurováno." },
      { status: 503 }
    );
  }

  const snap = await adminDb().collection("teams").doc(teamId).get();
  if (!snap.exists) {
    return NextResponse.json({ ok: false, error: "Tým nenalezen." }, { status: 404 });
  }

  const data = snap.data() as {
    captainId?: string;
    status?: string;
    faceitHubUrl?: string;
    teamName?: string;
    schoolName?: string;
    captainEmail?: string;
    gameId?: GameId;
  };

  if (data.captainId !== user.uid) {
    return NextResponse.json({ ok: false, error: "Přístup odepřen." }, { status: 403 });
  }
  if (data.status !== "approved") {
    return NextResponse.json(
      { ok: false, error: "Tým není schválený." },
      { status: 403 }
    );
  }
  const hub = typeof data.faceitHubUrl === "string" ? data.faceitHubUrl.trim() : "";
  if (!hub) {
    return NextResponse.json(
      { ok: false, error: "Faceit hub není k dispozici." },
      { status: 400 }
    );
  }

  const gid = data.gameId ?? "cs2";
  await notifyDiscordFaceitHubEntry({
    teamName: (data.teamName ?? "Tým").trim(),
    schoolName: data.schoolName?.trim(),
    captainEmail: (data.captainEmail ?? user.email ?? "").trim() || "—",
    gameLabel: gameLabel(gid),
    teamId,
  });

  return NextResponse.json({ ok: true });
}
