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
    const teams = (await listCollectionDocsRest("teams", 400))
      .filter((row) => (scope === "all" ? true : row.status === "pending"))
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
