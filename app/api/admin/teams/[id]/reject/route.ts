import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { sendTeamRejectedEmail } from "@/lib/resend-team-status";
import { getDocRest, upsertDocRest } from "@/lib/firebase/firestore-rest-admin";

export async function POST(
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
  let reason = "";
  try {
    const j = await request.json();
    reason = typeof j.reason === "string" ? j.reason : "";
  } catch {
    /* prázdné */
  }

  try {
    const team = await getDocRest(`teams/${id}`);
    if (!team) {
      return NextResponse.json({ ok: false, error: "Tým nenalezen." }, { status: 404 });
    }
    const data = team as {
      teamName?: string;
      captainEmail?: string;
    };
    await upsertDocRest(`teams/${id}`, {
      status: "rejected",
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    });

    const captainEmail = (data.captainEmail ?? "").trim();
    const teamName = (data.teamName ?? "Tým").trim();
    let emailSent = false;
    let emailError: string | undefined;
    if (captainEmail) {
      const sent = await sendTeamRejectedEmail(captainEmail, teamName, reason);
      emailSent = sent.ok;
      if (!sent.ok) emailError = sent.error;
    }

    return NextResponse.json({
      ok: true,
      emailSent,
      ...(emailError ? { emailError } : {}),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
