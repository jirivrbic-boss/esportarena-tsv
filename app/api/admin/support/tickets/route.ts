import { NextResponse } from "next/server";
import { listCollectionDocsRest } from "@/lib/firebase/firestore-rest-admin";
import { verifyAdminBearer } from "@/lib/server-auth";
import { rowToTicket } from "@/lib/support-firestore";

export async function GET(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const rows = await listCollectionDocsRest("support_tickets", 300);
    const tickets = rows
      .map((r) => rowToTicket(r as Record<string, unknown> & { id: string }))
      .filter(Boolean);
    tickets.sort((a, b) => {
      const ta = Date.parse(a!.createdAt) || 0;
      const tb = Date.parse(b!.createdAt) || 0;
      return tb - ta;
    });
    return NextResponse.json({ ok: true, tickets });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
