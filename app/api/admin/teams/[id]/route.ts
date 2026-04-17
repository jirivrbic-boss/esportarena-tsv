import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import {
  deleteDocRest,
  getDocRest,
  listCollectionDocsRest,
} from "@/lib/firebase/firestore-rest-admin";

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Neplatné ID týmu." }, { status: 400 });
  }

  try {
    const team = await getDocRest(`teams/${id}`);
    if (!team) {
      return NextResponse.json({ ok: false, error: "Tým neexistuje." }, { status: 404 });
    }

    const tournaments = await listCollectionDocsRest("tournaments", 300);
    await Promise.all(
      tournaments.map((t) =>
        deleteDocRest(`tournaments/${t.id}/registrations/${id}`).catch(() => false)
      )
    );
    await deleteDocRest(`teams/${id}`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
