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
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const status = searchParams.get("status");
    const gameId = searchParams.get("gameId");
    const teams = (await listCollectionDocsRest("teams", 400))
      .filter((row) => {
        if (scope === "all" || status === "approved") {
          if (status === "approved" && row.status !== "approved") return false;
        } else if (row.status !== "pending") {
          return false;
        }
        if (gameId) {
          const gid = String(row.gameId ?? "cs2");
          if (gid !== gameId) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const ta = typeof a.createdAt === "string" ? Date.parse(a.createdAt) || 0 : 0;
        const tb = typeof b.createdAt === "string" ? Date.parse(b.createdAt) || 0 : 0;
        return tb - ta;
      });
    return NextResponse.json({ ok: true, teams });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
