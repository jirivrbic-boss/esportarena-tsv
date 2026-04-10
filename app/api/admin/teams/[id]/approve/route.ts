import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { verifyIdTokenFromRequest, isAdminEmail } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase/admin";
import { sendTeamApprovedEmail } from "@/lib/resend-team-status";
import { gameLabel, type GameId } from "@/lib/games";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const authUser = await verifyIdTokenFromRequest(request);
  if (!authUser) {
    return NextResponse.json(
      { ok: false, error: "Chybí nebo neplatný token." },
      { status: 401 }
    );
  }
  if (!isAdminEmail(authUser.email)) {
    return NextResponse.json({ ok: false, error: "Přístup odepřen." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const hubUrl =
    process.env.NEXT_PUBLIC_FACEIT_HUB_URL ??
    "https://www.faceit.com/";

  try {
    const ref = adminDb().collection("teams").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Tým nenalezen." }, { status: 404 });
    }
    const data = snap.data() as {
      teamName?: string;
      captainEmail?: string;
      gameId?: GameId;
    };
    const gid = data.gameId ?? "cs2";
    const gLabel = gameLabel(gid);
    const isCs2 = gid === "cs2";

    await ref.update({
      status: "approved",
      ...(isCs2
        ? { faceitHubUrl: hubUrl }
        : { faceitHubUrl: FieldValue.delete() }),
      updatedAt: new Date(),
    });

    const captainEmail = (data.captainEmail ?? "").trim();
    const teamName = (data.teamName ?? "Tým").trim();
    let emailSent = false;
    let emailError: string | undefined;
    if (captainEmail) {
      const sent = await sendTeamApprovedEmail(
        captainEmail,
        teamName,
        isCs2 ? hubUrl : undefined,
        gLabel
      );
      emailSent = sent.ok;
      if (!sent.ok) emailError = sent.error;
    }

    return NextResponse.json({
      ok: true,
      faceitHubUrl: isCs2 ? hubUrl : null,
      emailSent,
      ...(emailError ? { emailError } : {}),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
