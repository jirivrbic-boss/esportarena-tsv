import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { listCollectionDocsRest } from "@/lib/firebase/firestore-rest-admin";

export async function GET(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const teams = await listCollectionDocsRest("teams", 500);
    const countByCaptain = new Map<string, number>();
    for (const t of teams) {
      const cid = String(t.captainId ?? "");
      if (!cid) continue;
      countByCaptain.set(cid, (countByCaptain.get(cid) ?? 0) + 1);
    }

    const users = await listCollectionDocsRest("users", 500);
    const captains = users
      .map((u) => ({
        uid: u.id,
        email: String(u.email ?? ""),
        firstName: String(u.firstName ?? ""),
        lastName: String(u.lastName ?? ""),
        discordUsername: String(u.discordUsername ?? ""),
        profileComplete: Boolean(u.profileComplete),
        teamCount: countByCaptain.get(u.id) ?? 0,
        banned: Boolean(u.banned),
        banReason: String(u.banReason ?? ""),
        pendingDeletionExpiresAt:
          typeof u.pendingDeletionExpiresAt === "string"
            ? u.pendingDeletionExpiresAt
            : null,
      }))
      .sort((a, b) => a.email.localeCompare(b.email, "cs"));

    return NextResponse.json({ ok: true, captains });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
