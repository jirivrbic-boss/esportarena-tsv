import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { getDocRest } from "@/lib/firebase/firestore-rest-admin";
import { listTournamentInvitationsRest } from "@/lib/tournament-invitations";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { id } = await ctx.params;
  try {
    const tournament = await getDocRest(`tournaments/${id}`);
    if (!tournament) {
      return NextResponse.json({ ok: false, error: "Turnaj nenalezen." }, { status: 404 });
    }

    const invitations = await listTournamentInvitationsRest(id);
    return NextResponse.json({
      ok: true,
      invitations: invitations.map((inv) => ({
        teamId: inv.id,
        teamName: inv.teamName,
        schoolName: inv.schoolName,
        status: inv.status,
        captainEmail: inv.captainEmail,
      })),
      invitedTeamIds: invitations.map((inv) => inv.id),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
